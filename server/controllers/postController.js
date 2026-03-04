const supabase = require('../config/db');

// ─────────────────────────────────────────────────────────────
// Helper: verifera att resursen tillhör inloggad barber
// ─────────────────────────────────────────────────────────────
async function ownerCheck(table, id, userId) {
    const { data } = await supabase.from(table).select('user_id').eq('id', id).single();
    return data && data.user_id === userId;
}

// ─────────────────────────────────────────────────────────────
// PUBLIK — GET /api/posts/haircuts
// ─────────────────────────────────────────────────────────────
async function getAllHaircuts(req, res) {
    const { data, error } = await supabase
        .from('haircut_posts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
}

// ─────────────────────────────────────────────────────────────
// PUBLIK — GET /api/posts/items
// ─────────────────────────────────────────────────────────────
async function getAllItems(req, res) {
    const { data, error } = await supabase
        .from('item_posts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
}

// ─────────────────────────────────────────────────────────────
// BARBER — GET /api/posts/my/haircuts  (egna tjänster, inkl inaktiva)
// ─────────────────────────────────────────────────────────────
async function getMyHaircuts(req, res) {
    const { data, error } = await supabase
        .from('haircut_posts')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
}

// ─────────────────────────────────────────────────────────────
// BARBER — GET /api/posts/my/items  (egna produkter, inkl inaktiva)
// ─────────────────────────────────────────────────────────────
async function getMyItems(req, res) {
    const { data, error } = await supabase
        .from('item_posts')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
}

// ─────────────────────────────────────────────────────────────
// BARBER — POST /api/posts/haircuts
// ─────────────────────────────────────────────────────────────
async function createHaircut(req, res) {
    const { title, description, price, time_taken, image_url, duration_minutes } = req.body;
    const user_id = req.user.id;

    if (!title || price === undefined) {
        return res.status(400).json({ error: 'Titel och pris är obligatoriska' });
    }

    const finalDuration = duration_minutes || 60;
    const finalTimeTaken = time_taken || `${finalDuration} min`;

    const { data, error } = await supabase
        .from('haircut_posts')
        .insert([{
            user_id,
            title,
            description,
            price,
            time_taken: finalTimeTaken,
            image_url,
            duration_minutes: finalDuration
        }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
}

// ─────────────────────────────────────────────────────────────
// BARBER — PUT /api/posts/haircuts/:id
// ─────────────────────────────────────────────────────────────
async function updateHaircut(req, res) {
    const { id } = req.params;
    if (!await ownerCheck('haircut_posts', id, req.user.id)) {
        return res.status(403).json({ error: 'Du kan bara redigera dina egna tjänster' });
    }
    const { title, description, price, time_taken, image_url, duration_minutes } = req.body;
    const { data, error } = await supabase
        .from('haircut_posts')
        .update({ title, description, price, time_taken, image_url, duration_minutes })
        .eq('id', id)
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data[0]);
}

// ─────────────────────────────────────────────────────────────
// BARBER — DELETE /api/posts/haircuts/:id
// ─────────────────────────────────────────────────────────────
async function deleteHaircut(req, res) {
    const { id } = req.params;
    if (!await ownerCheck('haircut_posts', id, req.user.id)) {
        return res.status(403).json({ error: 'Du kan bara ta bort dina egna tjänster' });
    }
    const { error } = await supabase.from('haircut_posts').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ message: 'Tjänst borttagen!' });
}

// ─────────────────────────────────────────────────────────────
// BARBER — PATCH /api/posts/haircuts/:id/toggle  (aktiv/inaktiv)
// ─────────────────────────────────────────────────────────────
async function toggleHaircut(req, res) {
    const { id } = req.params;
    const { data: current } = await supabase.from('haircut_posts').select('user_id, is_active').eq('id', id).single();
    if (!current || current.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Du kan bara ändra dina egna tjänster' });
    }
    const { data, error } = await supabase
        .from('haircut_posts')
        .update({ is_active: !current.is_active })
        .eq('id', id)
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data[0]);
}

// ─────────────────────────────────────────────────────────────
// BARBER — POST /api/posts/items
// ─────────────────────────────────────────────────────────────
async function createItem(req, res) {
    const { title, description, price, image_url, category } = req.body;
    const user_id = req.user.id;

    if (!title || price === undefined) {
        return res.status(400).json({ error: 'Titel och pris är obligatoriska' });
    }

    const { data, error } = await supabase
        .from('item_posts')
        .insert([{ user_id, title, description, price, image_url, category: category || 'general' }])
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
}

// ─────────────────────────────────────────────────────────────
// BARBER — PUT /api/posts/items/:id
// ─────────────────────────────────────────────────────────────
async function updateItem(req, res) {
    const { id } = req.params;
    if (!await ownerCheck('item_posts', id, req.user.id)) {
        return res.status(403).json({ error: 'Du kan bara redigera dina egna produkter' });
    }
    const { title, description, price, image_url, category } = req.body;
    const { data, error } = await supabase
        .from('item_posts')
        .update({ title, description, price, image_url, category })
        .eq('id', id)
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data[0]);
}

// ─────────────────────────────────────────────────────────────
// BARBER — DELETE /api/posts/items/:id
// ─────────────────────────────────────────────────────────────
async function deleteItem(req, res) {
    const { id } = req.params;
    if (!await ownerCheck('item_posts', id, req.user.id)) {
        return res.status(403).json({ error: 'Du kan bara ta bort dina egna produkter' });
    }
    const { error } = await supabase.from('item_posts').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ message: 'Produkt borttagen!' });
}

// ─────────────────────────────────────────────────────────────
// BARBER — PATCH /api/posts/items/:id/toggle
// ─────────────────────────────────────────────────────────────
async function toggleItem(req, res) {
    const { id } = req.params;
    const { data: current } = await supabase.from('item_posts').select('user_id, is_active').eq('id', id).single();
    if (!current || current.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Du kan bara ändra dina egna produkter' });
    }
    const { data, error } = await supabase
        .from('item_posts')
        .update({ is_active: !current.is_active })
        .eq('id', id)
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data[0]);
}

// ─────────────────────────────────────────────────────────────
// BARBER — PATCH /api/bookings/:id/complete (markera utförd)
// Obs: placerad i postController för enkelhet
// ─────────────────────────────────────────────────────────────
async function completeBooking(req, res) {
    const { id } = req.params;
    const { data: booking } = await supabase
        .from('bookings')
        .select('id, haircut_id, haircut_posts(user_id)')
        .eq('id', id)
        .single();
    if (!booking) return res.status(404).json({ error: 'Bokning hittades inte' });
    if (booking.haircut_posts?.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Tillhör inte dig' });
    }
    const { error } = await supabase.from('bookings').update({ status: 'completed' }).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ message: 'Bokning markerad som utförd!' });
}

module.exports = {
    getAllHaircuts, getAllItems,
    getMyHaircuts, getMyItems,
    createHaircut, updateHaircut, deleteHaircut, toggleHaircut,
    createItem, updateItem, deleteItem, toggleItem,
    completeBooking,
};
