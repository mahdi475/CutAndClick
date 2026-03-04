const supabase = require('../config/db');

// GET /api/notifications — mina notifikationer
async function getNotifications(req, res) {
    const user_id = req.user.id;
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false })
            .limit(50);
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Serverfel' });
    }
}

// PATCH /api/notifications/:id — markera som läst
async function markRead(req, res) {
    const user_id = req.user.id;
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .eq('user_id', user_id);
        if (error) return res.status(400).json({ error: error.message });
        res.status(200).json({ message: 'Markerad som läst' });
    } catch (err) {
        res.status(500).json({ error: 'Serverfel' });
    }
}

// PATCH /api/notifications/read-all — markera alla som lästa
async function markAllRead(req, res) {
    const user_id = req.user.id;
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user_id)
            .eq('is_read', false);
        if (error) return res.status(400).json({ error: error.message });
        res.status(200).json({ message: 'Alla markerade som lästa' });
    } catch (err) {
        res.status(500).json({ error: 'Serverfel' });
    }
}

// Helper: skapa en in-app notifikation (anropas från andra controllers)
async function createNotification({ user_id, type, title, body }) {
    try {
        await supabase.from('notifications').insert([{ user_id, type, title, body }]);
    } catch (err) {
        console.error('[Notification] Fel vid skapande:', err.message);
    }
}

module.exports = { getNotifications, markRead, markAllRead, createNotification };
