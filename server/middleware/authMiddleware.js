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
        // Vi kollar ALLTID databasen för att vara säkra, eftersom Supabase 'role' ofta är 'authenticated'
        const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (error || !data) {
            console.error('requireBarber: profil saknas i DB', error);
            return res.status(403).json({
                error: 'Konto-profil saknas',
                debug: { userId: req.user.id, error: error?.message }
            });
        }

        if (data.role !== 'barber') {
            console.log(`requireBarber: User ${req.user.id} has role "${data.role}", but "barber" is required.`);
            return res.status(403).json({
                error: 'Åtkomst nekad — kräver barber-roll',
                debug: { userId: req.user.id, roleFound: data.role }
            });
        }

        next();
    } catch (err) {
        console.error('requireBarber fel:', err);
        res.status(500).json({ error: 'Serverfel vid rollvalidering' });
    }
}

// ----------------------------------------
// optionalProtect — fångar upp user om token finns, annars fortsätt
// ----------------------------------------
async function optionalProtect(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }
    const token = authHeader.split(' ')[1];
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data.user) {
        req.user = data.user;
    }
    next();
}

module.exports = { protect, optionalProtect, requireBarber };
