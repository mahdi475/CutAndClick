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

module.exports = { getAllHaircuts, getAllItems };
