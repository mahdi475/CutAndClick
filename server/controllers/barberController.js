const supabase = require('../config/db');

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800';

// ─────────────────────────────────────────────
// GET /api/barbers
// Lista alla barbers med salongsinfo + rating
// ─────────────────────────────────────────────
async function getAllBarbers(req, res) {
    try {
        const { data, error } = await supabase
            .from('barber_profiles')
            .select(`
                user_id,
                salon_name,
                salon_address,
                city,
                cover_image,
                rating,
                total_reviews,
                bio,
                phone,
                created_at,
                users!inner(id, username, role)
            `)
            .order('rating', { ascending: false });

        if (error) return res.status(400).json({ error: error.message });

        const barbers = (data || []).map(formatBarber);
        res.status(200).json(barbers);
    } catch (err) {
        console.error('getAllBarbers fel:', err);
        res.status(500).json({ error: 'Serverfel vid hämtning av barbers' });
    }
}

// ─────────────────────────────────────────────
// GET /api/barbers/search?q=
// Sök på salongsnamn eller stad
// ─────────────────────────────────────────────
async function searchBarbers(req, res) {
    const q = req.query.q?.trim() || '';

    if (!q) return getAllBarbers(req, res);

    try {
        const { data, error } = await supabase
            .from('barber_profiles')
            .select(`
                user_id, salon_name, salon_address, city, cover_image,
                rating, total_reviews, bio, phone, created_at,
                users!inner(id, username, role)
            `)
            .or(`salon_name.ilike.%${q}%,city.ilike.%${q}%`)
            .order('rating', { ascending: false });

        if (error) return res.status(400).json({ error: error.message });

        res.status(200).json((data || []).map(formatBarber));
    } catch (err) {
        console.error('searchBarbers fel:', err);
        res.status(500).json({ error: 'Serverfel vid sökning' });
    }
}

// ─────────────────────────────────────────────
// GET /api/barbers/nearby?city=
// Filtrera på stad
// ─────────────────────────────────────────────
async function getNearbyBarbers(req, res) {
    const city = req.query.city?.trim() || '';

    try {
        let query = supabase
            .from('barber_profiles')
            .select(`
                user_id, salon_name, salon_address, city, cover_image,
                rating, total_reviews, bio, phone, created_at,
                users!inner(id, username, role)
            `)
            .order('rating', { ascending: false });

        if (city) {
            query = query.ilike('city', `%${city}%`);
        }

        const { data, error } = await query;
        if (error) return res.status(400).json({ error: error.message });

        res.status(200).json((data || []).map(formatBarber));
    } catch (err) {
        console.error('getNearbyBarbers fel:', err);
        res.status(500).json({ error: 'Serverfel vid närhetsfiltrering' });
    }
}

// ─────────────────────────────────────────────
// GET /api/barbers/:id
// Detaljer för en specifik barber
// Returnerar: tjänster + produkter + öppettider
// ─────────────────────────────────────────────
async function getBarberById(req, res) {
    const { id } = req.params;

    try {
        // Hämta barber profil
        const { data: profile, error: profileError } = await supabase
            .from('barber_profiles')
            .select(`
                user_id, salon_name, salon_address, city, cover_image,
                rating, total_reviews, bio, phone, created_at,
                users!inner(id, username, role)
            `)
            .eq('user_id', id)
            .single();

        if (profileError || !profile) {
            return res.status(404).json({ error: 'Barber hittades inte' });
        }

        // Hämta tjänster (haircut_posts)
        const { data: services } = await supabase
            .from('haircut_posts')
            .select('id, title, description, price, time_taken, image_url, duration_minutes, is_active')
            .eq('user_id', id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        // Hämta produkter (item_posts)
        const { data: products } = await supabase
            .from('item_posts')
            .select('id, title, description, price, status, image_url, category, is_active')
            .eq('user_id', id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        // Hämta öppettider
        const { data: openingHours } = await supabase
            .from('opening_hours')
            .select('day_of_week, open_time, close_time, is_closed')
            .eq('user_id', id)
            .order('day_of_week');

        const barber = formatBarber(profile);

        res.status(200).json({
            ...barber,
            services: (services || []).map(s => ({
                id: String(s.id),
                title: s.title,
                description: s.description || '',
                price: s.price,
                image: s.image_url || FALLBACK_IMAGE,
                duration_minutes: s.duration_minutes || 60,
                time_taken: s.time_taken,
            })),
            products: (products || []).map(p => ({
                id: String(p.id),
                title: p.title,
                subtitle: p.description || p.category || '',
                price: p.price,
                image: p.image_url || FALLBACK_IMAGE,
                category: p.category || 'general',
            })),
            opening_hours: openingHours || [],
        });
    } catch (err) {
        console.error('getBarberById fel:', err);
        res.status(500).json({ error: 'Serverfel vid hämtning av barber' });
    }
}

// ─────────────────────────────────────────────
// Helper: formaterar en barber_profile-rad till frontend-format
// ─────────────────────────────────────────────
function formatBarber(row) {
    const user = row.users;
    return {
        id: row.user_id,
        name: row.salon_name,
        salon_name: row.salon_name,
        address: row.salon_address,
        city: row.city,
        image: row.cover_image || FALLBACK_IMAGE,
        cover_image: row.cover_image || FALLBACK_IMAGE,
        rating: row.rating || 0,
        total_reviews: row.total_reviews || 0,
        bio: row.bio || '',
        phone: row.phone || '',
        isPopular: (row.rating || 0) >= 4.5,
        barber_name: user?.username || '',
        created_at: row.created_at,
    };
}

module.exports = { getAllBarbers, searchBarbers, getNearbyBarbers, getBarberById };
