// notiser — hämta, markera läst, skapa
const supabase = require('../config/db');

// hämta mina notiser
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

// markera en som läst
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

// markera alla som lästa
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

// helper: skapa notis, andra controllers kallar denna
async function createNotification({ user_id, type, title, body }) {
    try {
        await supabase.from('notifications').insert([{ user_id, type, title, body }]);
    } catch (err) {
        console.error('[Notification] Fel vid skapande:', err.message);
    }
}

module.exports = { getNotifications, markRead, markAllRead, createNotification };
