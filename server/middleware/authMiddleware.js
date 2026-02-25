const supabase = require('../config/db');

// Skyddar routes som kräver att man är inloggad.
// Används som: router.get('/min-route', protect, controller)
async function protect(req, res, next) {
    // Läs token från Authorization-headern: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Ingen token – du måste logga in' });
    }

    const token = authHeader.split(' ')[1];

    // Fråga Supabase om token är giltig
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return res.status(401).json({ error: 'Ogiltig eller utgången token' });
    }

    // Spara användarens info på req så nästa funktion kan använda den
    req.user = data.user;

    next();
}

module.exports = { protect };
