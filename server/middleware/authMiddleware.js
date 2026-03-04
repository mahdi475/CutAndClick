const supabase = require('../config/db');

// ----------------------------------------
// protect — kräver giltig inloggning
// ----------------------------------------
async function protect(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Ingen token – du måste logga in' });
    }

    const token = authHeader.split(' ')[1];

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return res.status(401).json({ error: 'Ogiltig eller utgången token' });
    }

    req.user = data.user;
    next();
}

// ----------------------------------------
// requireBarber — kräver att inloggad user är barber
// Måste köras AFTER protect
// ----------------------------------------
async function requireBarber(req, res, next) {
    try {
        // Kontrollera rollen direkt från JWT-datan eller tidigare middleware
        const role = req.user?.user_metadata?.role || req.user?.role;

        if (!role) {
            // Fallback: om rollen inte finns i token, gör ett snabbt DB-anrop men använd single()
            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', req.user.id)
                .single();

            if (error || !data || data.role !== 'barber') {
                return res.status(403).json({ error: 'Åtkomst nekad — kräver barber-roll' });
            }
            next();
        } else if (role !== 'barber') {
            return res.status(403).json({ error: 'Åtkomst nekad — kräver barber-roll' });
        } else {
            next();
        }
    } catch (err) {
        console.error('requireBarber fel:', err);
        res.status(500).json({ error: 'Serverfel vid rollvalidering' });
    }
}

module.exports = { protect, requireBarber };
