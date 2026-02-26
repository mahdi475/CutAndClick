const supabase = require('../config/db');

// --- REGISTRERING ---
async function registerUser(req, res) {
    const { email, password, username, location } = req.body;

    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email, password
        });

        if (authError) return res.status(400).json({ error: authError.message });

        const { error: dbError } = await supabase.from('users').insert([
            { id: authData.user.id, username, location, role: 'customer' }
        ]);

        if (dbError) return res.status(400).json({ error: dbError.message });

        res.status(201).json({ message: 'Kontot är skapat!' });
    } catch (err) {
        res.status(500).json({ error: 'Serverfel vid registrering' });
    }
}

async function loginUser(req, res) {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email, password
        });

        if (error) return res.status(401).json({ error: 'Fel mejl eller lösenord' });

        res.status(200).json({ message: 'Välkommen in!', session: data.session });
    } catch (err) {
        res.status(500).json({ error: 'Serverfel vid inloggning' });
    }
}

// --- PROFIL ---
// GET /api/auth/profile — hämtar den inloggade användarens profilinfo
async function getProfile(req, res) {
    const user_id = req.user.id;

    const { data, error } = await supabase
        .from('users')
        .select('id, username, location, role')
        .eq('id', user_id)
        .single();

    if (error) return res.status(404).json({ error: 'Profil hittades inte' });

    res.status(200).json(data);
}

module.exports = { registerUser, loginUser, getProfile };