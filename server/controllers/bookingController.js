const supabase = require('../config/db');

// Hjälpfunktion: generera alla tider mellan öppning och stängning
// t.ex. open="09:00", close="17:00" → ["09:00","10:00",...,"16:00"]
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

// GET /api/bookings/available/:haircutId?date=2026-03-01
// Publik – gäster kan se lediga tider utan att logga in
async function getAvailableSlots(req, res) {
    const { haircutId } = req.params;
    const { date } = req.query;

    if (!date) return res.status(400).json({ error: 'Ange ett datum: ?date=YYYY-MM-DD' });

    // Hämta klippningens info för att hitta rätt barberare
    const { data: haircut, error: hErr } = await supabase
        .from('haircut_posts')
        .select('user_id')
        .eq('id', haircutId)
        .single();

    if (hErr || !haircut) return res.status(404).json({ error: 'Klippning hittades inte' });

    // Hämta barberarens öppettider
    const { data: hours, error: hoursErr } = await supabase
        .from('opening_hours')
        .select('open_time, close_time')
        .eq('user_id', haircut.user_id)
        .single();

    if (hoursErr || !hours) return res.status(404).json({ error: 'Inga öppettider hittades' });

    // Hämta alla bokade tider för det datumet
    const { data: bookings } = await supabase
        .from('bookings')
        .select('booking_time')
        .eq('haircut_id', haircutId)
        .eq('booking_date', date);

    const bookedTimes = (bookings || []).map(b => b.booking_time.slice(0, 5));

    // Alla möjliga tider minus bokade = lediga tider
    const allSlots = generateSlots(hours.open_time, hours.close_time);
    const available = allSlots.filter(slot => !bookedTimes.includes(slot));

    res.status(200).json({ date, available });
}

// POST /api/bookings — kräver inloggning
async function createBooking(req, res) {
    const { haircut_id, booking_date, booking_time } = req.body;
    const customer_id = req.user.id;

    // Sista koll: är tiden fortfarande ledig innan vi sparar?
    const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('haircut_id', haircut_id)
        .eq('booking_date', booking_date)
        .eq('booking_time', booking_time)
        .single();

    if (existing) {
        return res.status(409).json({ error: 'Tiden är redan bokad – välj en annan tid' });
    }

    // Spara bokningen
    const { data, error } = await supabase
        .from('bookings')
        .insert([{ customer_id, haircut_id, booking_date, booking_time }])
        .select();

    if (error) {
        // Felkod 23505 = UNIQUE-brott (två bokade exakt samtidigt trots kollet ovan)
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Någon annan tog tiden precis nu – välj en annan' });
        }
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data[0]);
}

// GET /api/bookings/my — hämtar den inloggade kundens bokningar med klippningsinfo
async function getUserBookings(req, res) {
    const customer_id = req.user.id;

    // Join med haircut_posts för att få title, price och image_url direkt
    const { data, error } = await supabase
        .from('bookings')
        .select('id, booking_date, booking_time, haircut_posts(title, price, image_url)')
        .eq('customer_id', customer_id)
        .order('booking_date', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
}

module.exports = { getAvailableSlots, createBooking, getUserBookings };
