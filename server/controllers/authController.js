const supabase = require('../config/db');

async function registerUser(req, res) {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        })

        if (error) {
            return res.status(400).json({ error: error.message })
        }
        return res.status(201).json({ message: 'Användare är skapad' })
    }
    catch (err) {
        res.status(500).json({ error: 'Något i servern gick fel' })
    }
}

module.exports = { registerUser };