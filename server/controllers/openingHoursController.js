const supabase = require('../config/db');

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// ----------------------------------------
// GET /api/opening-hours/:userId
// Publik — gäster kan se öppettider
// ----------------------------------------
async function getOpeningHours(req, res) {
    const { userId } = req.params;

    try {
        const { data, error } = await supabase
            .from('opening_hours')
            .select('day_of_week, open_time, close_time, is_closed')
            .eq('user_id', userId)
            .order('day_of_week');

        if (error) return res.status(400).json({ error: error.message });

        // Om inga öppettider finns ännu — returnera default-struktur (stängd)
        if (!data || data.length === 0) {
            const defaultHours = DAYS.map(day => ({
                day_of_week: day,
                open_time: null,
                close_time: null,
                is_closed: true,
            }));
            return res.status(200).json(defaultHours);
        }

        res.status(200).json(data);
    } catch (err) {
        console.error('getOpeningHours fel:', err);
        res.status(500).json({ error: 'Serverfel vid hämtning av öppettider' });
    }
}

// ----------------------------------------
// PUT /api/opening-hours
// Kräver inloggning + barber-roll
// Body: Array<{ day_of_week, open_time, close_time, is_closed }>
// ----------------------------------------
async function updateOpeningHours(req, res) {
    const user_id = req.user.id;
    const hours = req.body; // förväntat: array

    // Validera att det är ett array
    if (!Array.isArray(hours)) {
        return res.status(400).json({ error: 'Body måste vara en array av öppettider' });
    }

    // Validera varje dag
    for (const item of hours) {
        if (!DAYS.includes(item.day_of_week)) {
            return res.status(400).json({ error: `Ogiltig dag: ${item.day_of_week}` });
        }
        if (typeof item.is_closed !== 'boolean') {
            return res.status(400).json({ error: `is_closed måste vara boolean för ${item.day_of_week}` });
        }
    }

    try {
        // Upsert — varje dag uppdateras eller skapas
        const upsertData = hours.map(item => ({
            user_id,
            day_of_week: item.day_of_week,
            open_time: item.is_closed ? null : (item.open_time || null),
            close_time: item.is_closed ? null : (item.close_time || null),
            is_closed: item.is_closed,
        }));

        const { error } = await supabase
            .from('opening_hours')
            .upsert(upsertData, { onConflict: 'user_id,day_of_week' });

        if (error) return res.status(400).json({ error: error.message });

        res.status(200).json({ message: 'Öppettider uppdaterades!' });
    } catch (err) {
        console.error('updateOpeningHours fel:', err);
        res.status(500).json({ error: 'Serverfel vid uppdatering av öppettider' });
    }
}

module.exports = { getOpeningHours, updateOpeningHours };
