const supabase = require('../config/db');

// GET /api/favourites — lista mina favoriter
async function getFavourites(req, res) {
    const user_id = req.user.id;
    try {
        const { data, error } = await supabase
            .from('favourites')
            .select(`
                barber_id,
                users!barber_id(
                    id, username,
                    barber_profiles(salon_name, salon_address, city, cover_image, rating)
                )
            `)
            .eq('user_id', user_id)
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });

        const formatted = (data || []).map(f => {
            const u = f.users;
            const p = u?.barber_profiles;
            return {
                barber_id: f.barber_id,
                barber_name: u?.username || '',
                salon_name: p?.salon_name || '',
                salon_address: p?.salon_address || '',
                city: p?.city || '',
                image: p?.cover_image || '',
                rating: p?.rating || null,
            };
        });

        res.status(200).json(formatted);
    } catch (err) {
        console.error('getFavourites fel:', err);
        res.status(500).json({ error: 'Serverfel' });
    }
}

// POST /api/favourites — lägg till favorit
async function addFavourite(req, res) {
    const user_id = req.user.id;
    const { barber_id } = req.body;
    if (!barber_id) return res.status(400).json({ error: 'barber_id krävs' });

    try {
        const { data, error } = await supabase
            .from('favourites')
            .insert([{ user_id, barber_id }])
            .select()
            .single();

        if (error) {
            // 23505 = unique violation = redan favorit
            if (error.code === '23505') return res.status(200).json({ message: 'Redan i favoriter' });
            return res.status(400).json({ error: error.message });
        }
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Serverfel' });
    }
}

// DELETE /api/favourites/:barberId — ta bort favorit
async function removeFavourite(req, res) {
    const user_id = req.user.id;
    const barber_id = req.params.barberId;

    try {
        const { error } = await supabase
            .from('favourites')
            .delete()
            .eq('user_id', user_id)
            .eq('barber_id', barber_id);

        if (error) return res.status(400).json({ error: error.message });
        res.status(200).json({ message: 'Favorit borttagen' });
    } catch (err) {
        res.status(500).json({ error: 'Serverfel' });
    }
}

module.exports = { getFavourites, addFavourite, removeFavourite };
