const supabase = require('../config/db');

// GET /api/reviews/:barberId — publik
async function getReviews(req, res) {
    const { barberId } = req.params;
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                id, stars, review_title, review_description, created_at,
                users!reviews_user_id_fkey(username)
            `)
            .eq('target_user_id', barberId)
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });

        const reviews = (data || []).map(r => ({
            id: r.id,
            stars: r.stars,
            review_title: r.review_title,
            review_description: r.review_description,
            created_at: r.created_at,
            reviewer_name: r.users?.username || 'Anonym',
        }));

        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: 'Serverfel' });
    }
}

// POST /api/reviews — kräver inloggning + kund-roll
async function createReview(req, res) {
    const reviewer_id = req.user.id;
    const { barber_id, stars, review_title, review_description } = req.body;

    // Validering
    if (!barber_id || !stars) return res.status(400).json({ error: 'barber_id och stars är obligatoriska' });
    if (stars < 1 || stars > 5) return res.status(400).json({ error: 'Stars måste vara 1-5' });
    if (review_description && review_description.length > 500) return res.status(400).json({ error: 'Beskrivning max 500 tecken' });

    try {
        // Kontrollera att kunden faktiskt bokat hos denna barber
        const { data: booking } = await supabase
            .from('bookings')
            .select('id, haircut_posts!inner(user_id)')
            .eq('customer_id', reviewer_id)
            .eq('haircut_posts.user_id', barber_id)
            .neq('status', 'cancelled')
            .limit(1)
            .single();

        if (!booking) {
            return res.status(403).json({ error: 'Du måste ha bokat hos denna barber för att lämna ett omdöme' });
        }

        // Kontrollera att kunden inte redan recenserat
        const { data: existing } = await supabase
            .from('reviews')
            .select('id')
            .eq('user_id', reviewer_id)   // user_id = reviewer i denna tabell
            .eq('target_user_id', barber_id)
            .single();

        if (existing) return res.status(409).json({ error: 'Du har redan lämnat ett omdöme för denna barber' });

        // Spara review (user_id = reviewer, target_user_id = barber)
        const { error: insertError } = await supabase
            .from('reviews')
            .insert([{ user_id: reviewer_id, target_user_id: barber_id, stars, review_title: review_title || null, review_description: review_description || null }]);

        if (insertError) return res.status(400).json({ error: insertError.message });

        // Uppdatera barber_profiles rating + total_reviews
        const { data: profile } = await supabase
            .from('barber_profiles')
            .select('rating, total_reviews')
            .eq('user_id', barber_id)
            .single();

        if (profile) {
            const oldTotalReviews = profile.total_reviews || 0;
            const oldRating = profile.rating || 0;
            const newTotal = oldTotalReviews + 1;
            const newRating = ((oldRating * oldTotalReviews) + stars) / newTotal;

            await supabase
                .from('barber_profiles')
                .update({ total_reviews: newTotal, rating: parseFloat(newRating.toFixed(1)) })
                .eq('user_id', barber_id);
        }

        res.status(201).json({ message: 'Omdöme skapat, tack!' });
    } catch (err) {
        console.error('createReview fel:', err);
        res.status(500).json({ error: 'Serverfel' });
    }
}

module.exports = { getReviews, createReview };
