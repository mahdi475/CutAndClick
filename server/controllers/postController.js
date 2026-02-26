const supabase = require('../config/db');

// Hämta alla klippningar (öppen för alla, ingen inloggning krävs)
async function getAllHaircuts(req, res) {
    const { data, error } = await supabase.from('haircut_posts').select('*');

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
}

// Hämta alla produkter (öppen för alla, ingen inloggning krävs)
async function getAllItems(req, res) {
    const { data, error } = await supabase.from('item_posts').select('*');

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
}

// Skapa ett nytt klipp-inlägg (kräver inloggning – protect sätter req.user)
async function createHaircut(req, res) {
    const { title, description, price, time_taken, image_url } = req.body;

    // user_id comes automatically from the logged-in user
    const user_id = req.user.id;

    const { data, error } = await supabase.from('haircut_posts').insert([
        { user_id, title, description, price, time_taken, image_url }
    ]).select();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json(data[0]);
}

module.exports = { getAllHaircuts, getAllItems, createHaircut };
