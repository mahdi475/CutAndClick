const supabase = require('../config/db');

// ─────────────────────────────────────────────
// Helper: Generate slots between open_time and close_time
// e.g. ('09:00', '17:00', 60) → ['09:00', '10:00', ..., '16:00']
// ─────────────────────────────────────────────
function generateSlots(open, close, intervalMinutes = 60) {
    const slots = [];
    let [h, m] = open.split(':').map(Number);
    const [closeH, closeM] = close.split(':').map(Number);
    while (h < closeH || (h === closeH && m < closeM)) {
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        m += intervalMinutes;
        if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
    }
    return slots;
}

// Helper: Swedish day name → day_of_week string
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
function getDayName(dateStr) {
    const d = new Date(dateStr + 'T12:00:00'); // midday to avoid TZ issues
    return DAY_NAMES[d.getDay()];
}

// ─────────────────────────────────────────────
// GET /api/bookings/available/:haircutId?date=YYYY-MM-DD
// Publik — gäster kan se lediga tider
// ─────────────────────────────────────────────
async function getAvailableSlots(req, res) {
    const { haircutId } = req.params;
    const { date } = req.query;

    if (!date) return res.status(400).json({ error: 'Ange ett datum: ?date=YYYY-MM-DD' });

    try {
        // Hämta klippningens barber + varaktighet
        const { data: haircut, error: hErr } = await supabase
            .from('haircut_posts')
            .select('user_id, duration_minutes')
            .eq('id', haircutId)
            .single();

        if (hErr || !haircut) return res.status(404).json({ error: 'Klippning hittades inte' });

        const dayName = getDayName(date);
        const durationMinutes = haircut.duration_minutes || 60;

        // Hämta öppettider för den specifika dagen (ny struktur: day_of_week)
        const { data: hours, error: hoursErr } = await supabase
            .from('opening_hours')
            .select('open_time, close_time, is_closed')
            .eq('user_id', haircut.user_id)
            .eq('day_of_week', dayName)
            .single();

        // Stängt den dagen
        if (hoursErr || !hours || hours.is_closed || !hours.open_time || !hours.close_time) {
            return res.status(200).json({ date, available: [], closed: true });
        }

        // Generera alla möjliga slots baserat på tjänstens varaktighet
        const allSlots = generateSlots(hours.open_time, hours.close_time, durationMinutes);

        // Hämta alla bokade tider för det datumet, för _alla_ tjänster den här frisören har
        const { data: bookings, error: bErr } = await supabase
            .from('bookings')
            .select('booking_time, haircut_posts!inner(user_id)')
            .eq('haircut_posts.user_id', haircut.user_id)
            .eq('booking_date', date)
            .neq('status', 'cancelled');

        const bookedTimes = new Set((bookings || []).map(b => (b.booking_time || '').slice(0, 5)));

        const available = allSlots.filter(slot => !bookedTimes.has(slot));

        res.status(200).json({ date, available, closed: false });
    } catch (err) {
        console.error('getAvailableSlots fel:', err);
        res.status(500).json({ error: 'Serverfel vid hämtning av lediga tider' });
    }
}

// ─────────────────────────────────────────────
// POST /api/bookings — kräver inloggning
// ─────────────────────────────────────────────
async function createBooking(req, res) {
    const { haircut_id, booking_date, booking_time } = req.body;
    const customer_id = req.user.id;

    if (!haircut_id || !booking_date || !booking_time) {
        return res.status(400).json({ error: 'haircut_id, booking_date och booking_time krävs' });
    }

    try {
        // Kontrollera att datumet inte är passerat
        if (new Date(booking_date) < new Date(new Date().toDateString())) {
            return res.status(400).json({ error: 'Du kan inte boka ett datum som redan passerat' });
        }

        // Spara bokningen (unik constraint hanterar race condition)
        const { data, error } = await supabase
            .from('bookings')
            .insert([{
                customer_id,
                haircut_id,
                booking_date,
                booking_time,      // kolumnen heter booking_time i faktisk DB
                status: 'confirmed',
            }])
            .select();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Tyvärr tog någon annan den just nu — välj en annan tid' });
            }
            return res.status(400).json({ error: error.message });
        }

        // ── Skapa in-app + e-post notifikationer (no-await, fail silently) ────
        (async () => {
            try {
                const { sendBookingConfirmation } = require('../utils/emailService');
                const { createNotification } = require('./notificationController');

                // Hämta salongsinfo + tjänst
                const { data: haircut } = await supabase.from('haircut_posts').select('title, price, users(id, barber_profiles(salon_name))').eq('id', haircut_id).single();
                const { data: authUser } = await supabase.auth.admin.getUserById(customer_id).catch(() => ({ data: null }));

                const salonName = haircut?.users?.barber_profiles?.salon_name || 'Salongen';
                const serviceTitle = haircut?.title || 'Tjänst';
                const barberUserId = haircut?.users?.id;

                // In-app notifikation till kund
                await createNotification({
                    user_id: customer_id,
                    type: 'booking_confirmed',
                    title: `Bokning bekräftad!`,
                    body: `${serviceTitle} hos ${salonName} den ${booking_date} kl ${booking_time}`,
                });

                // In-app notifikation till barber
                if (barberUserId) {
                    await createNotification({
                        user_id: barberUserId,
                        type: 'new_booking',
                        title: `Ny bokning inkom`,
                        body: `${serviceTitle} • ${booking_date} kl ${booking_time}`,
                    });
                }

                // E-post till kund
                console.log("[Booking] Checking authUser for email:", authUser);
                if (authUser?.user?.email) {
                    console.log("[Booking] Found email:", authUser.user.email);
                    const { data: customerProfile } = await supabase.from('users').select('username').eq('id', customer_id).single();
                    console.log("[Booking] Sending confirmation...");
                    sendBookingConfirmation({
                        to: authUser.user.email,
                        customerName: customerProfile?.username || 'Kund',
                        salonName,
                        date: booking_date,
                        time: booking_time,
                        service: serviceTitle,
                    });
                } else {
                    console.log("[Booking] No email found for user_id:", customer_id);
                }
            } catch (notifErr) {
                console.error('[Post-booking] Notifikationsfel (ej kritiskt):', notifErr.message);
            }
        })();

        res.status(201).json(data[0]);
    } catch (err) {
        console.error('createBooking fel:', err);
        res.status(500).json({ error: 'Serverfel vid bokning' });
    }
}

// ─────────────────────────────────────────────
// GET /api/bookings/my — kundens bokningar
// ─────────────────────────────────────────────
async function getUserBookings(req, res) {
    const customer_id = req.user.id;

    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                id, booking_date, booking_time, status, created_at,
                haircut_posts(id, title, price, image_url,
                    users(id, username,
                        barber_profiles(salon_name, salon_address, city, cover_image)
                    )
                )
            `)
            .eq('customer_id', customer_id)
            .order('booking_date', { ascending: true });

        if (error) return res.status(500).json({ error: error.message });

        // Normalisera till ett rent format
        const bookings = (data || []).map(b => {
            const haircut = b.haircut_posts;
            const barber = haircut?.users;
            const profile = barber?.barber_profiles;
            return {
                id: String(b.id),
                booking_date: b.booking_date,
                booking_time: b.booking_time ? String(b.booking_time).slice(0, 5) : '',
                status: b.status,
                service_title: haircut?.title || '',
                service_price: haircut?.price || 0,
                barber_id: barber?.id || '',
                barber_name: barber?.username || '',
                salon_name: profile?.salon_name || '',
                salon_address: profile?.salon_address || '',
                city: profile?.city || '',
                image: profile?.cover_image || haircut?.image_url || '',
            };
        });

        res.status(200).json(bookings);
    } catch (err) {
        console.error('getUserBookings fel:', err);
        res.status(500).json({ error: 'Serverfel vid hämtning av bokningar' });
    }
}

// ─────────────────────────────────────────────
// PATCH /api/bookings/:id/cancel — avboka
// ─────────────────────────────────────────────
async function cancelBooking(req, res) {
    const { id } = req.params;
    const customer_id = req.user.id;

    try {
        // Kontrollera att bokningen tillhör kunden
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('id, booking_date, status, customer_id')
            .eq('id', id)
            .single();

        if (fetchError || !booking) return res.status(404).json({ error: 'Bokning hittades inte' });
        if (booking.customer_id !== customer_id) return res.status(403).json({ error: 'Du kan bara avboka dina egna bokningar' });
        if (booking.status === 'cancelled') return res.status(400).json({ error: 'Bokningen är redan avbokad' });

        // Kontrollera att datumet är i framtiden
        if (new Date(booking.booking_date) < new Date(new Date().toDateString())) {
            return res.status(400).json({ error: 'Du kan inte avboka en bokning som redan passerat' });
        }

        const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', id);

        if (updateError) return res.status(400).json({ error: updateError.message });

        res.status(200).json({ message: 'Bokning avbokad!' });
    } catch (err) {
        console.error('cancelBooking fel:', err);
        res.status(500).json({ error: 'Serverfel vid avbokning' });
    }
}

// ─────────────────────────────────────────────
// GET /api/bookings/barber — barbers bokningar
// Kräver inloggning + barber-roll
// ─────────────────────────────────────────────
async function getBarberBookings(req, res) {
    const barber_id = req.user.id;
    const { date } = req.query;

    try {
        let query = supabase
            .from('bookings')
            .select(`
                id, booking_date, booking_time, status, created_at,
                haircut_posts!inner(id, title, price, user_id),
                users!bookings_customer_id_fkey(id, username)
            `)
            .eq('haircut_posts.user_id', barber_id)
            .order('booking_date', { ascending: true })
            .order('booking_time', { ascending: true });

        if (date) {
            query = query.eq('booking_date', date);
        }

        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });

        const bookings = (data || []).map(b => ({
            id: String(b.id),
            booking_date: b.booking_date,
            booking_time: b.booking_time ? String(b.booking_time).slice(0, 5) : '',
            status: b.status,
            service_title: b.haircut_posts?.title || '',
            service_price: b.haircut_posts?.price || 0,
            customer_name: b.users?.username || 'Kund',
        }));

        res.status(200).json(bookings);
    } catch (err) {
        console.error('getBarberBookings fel:', err);
        res.status(500).json({ error: 'Serverfel vid hämtning av barberbokningar' });
    }
}

module.exports = {
    getAvailableSlots,
    createBooking,
    getUserBookings,
    cancelBooking,
    getBarberBookings,
};
