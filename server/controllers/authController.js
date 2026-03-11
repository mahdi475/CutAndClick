const { createClient } = require('@supabase/supabase-js');
const supabase = require('../config/db');

// ─────────────────────────────────────────────
// REGISTRERING
// ─────────────────────────────────────────────
async function registerUser(req, res) {
    const { email, password, username, location, role, salon_name, salon_address, city, phone } = req.body;

    const validRole = role === 'barber' ? 'barber' : 'customer';

    try {
        // Skapa en temporär klient för Auth så vi inte smutsar ner serverns admin-klient (db.js)
        const tempSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
            auth: { persistSession: false }
        });

        // 1. Skapa Supabase Auth-konto
        let authData, authError;
        const signupRes = await tempSupabase.auth.signUp({
            email,
            password,
            options: {
                data: { role: validRole } // Spara rollen i metadata för snabbare åtkomst i JWT
            }
        });
        authData = signupRes.data;
        authError = signupRes.error;

        // Fallback: If we hit the email rate limit from testing too much, force creation via admin API
        if (authError && authError.message.includes('rate limit')) {
            console.log("Rate limit hit during signUp, forcing creation via admin API...");
            const adminRes = await supabase.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true // auto-confirm since it's admin
            });

            if (adminRes.error) {
                authError = adminRes.error;
            } else {
                authData = { user: adminRes.data.user, session: null }; // Admin create gives no session
                authError = null;
            }
            // Note: Since admin.createUser doesn't return a session, they will have to log in manually 
            // after registering if this fallback is used, but that's better than being completely blocked.
        }

        if (authError) {
            console.error("SUPABASE AUTH SIGNUP ERROR:", authError.message);
            return res.status(400).json({ error: authError.message });
        }

        console.log("DEBUG REGISTRATION AUTHDATA:", authData);
        const userId = authData.user.id;

        // 2. Spara i users-tabellen
        const userLocation = location || city || '';
        const { error: dbError } = await supabase.from('users').insert([{
            id: userId,
            username: username,
            location: userLocation,
            role: validRole,
        }]);

        if (dbError) {
            console.error("USERS TABLE INSERT ERROR:", dbError.message);
            return res.status(400).json({ error: dbError.message });
        }

        // 3. Om barber: spara i barber_profiles
        if (validRole === 'barber') {
            if (!salon_name || !salon_address || !city) {
                return res.status(400).json({
                    error: 'Salongens namn, adress och stad är obligatoriska för barbers'
                });
            }
            const { error: barberError } = await supabase.from('barber_profiles').insert([{
                user_id: userId,
                salon_name,
                salon_address,
                city,
                phone: phone || null,
            }]);
            if (barberError) {
                console.error("BARBER PROFILES INSERT ERROR:", barberError.message);
                return res.status(400).json({ error: barberError.message });
            }
        }

        res.status(201).json({
            message: 'Kontot är skapat!',
            role: validRole,
            session: authData.session,
        });
    } catch (err) {
        console.error('REGISTRATION SERVER ERROR:', err);
        res.status(500).json({ error: err.message || err.toString() });
    }
}

// ─────────────────────────────────────────────
// INLOGGNING
// ─────────────────────────────────────────────

async function loginUser(req, res) {
    const { email, password } = req.body;

    try {
        // Kör signInWithPassword på en HELT NY temporär klient så den globala admin-klienten (db.js) inte smittas av RLS!
        const tempSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
            auth: { persistSession: false }
        });

        const { data, error } = await tempSupabase.auth.signInWithPassword({ email, password });
        if (error) return res.status(401).json({ error: 'Fel mejl eller lösenord' });

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, username, location, role, profile_pic_url')
            .eq('id', data.user.id)
            .single();

        if (userError || !userData) {
            console.error("LOGIN DB FETCH ERROR:", userError, "DATA:", userData, "USER ID:", data.user.id);
            return res.status(404).json({ error: 'Konto-profil saknas i databasen' });
        }

        // Normalisera: säkerställ att username alltid finns
        const normalizedUser = {
            id: data.user.id,
            username: userData.username || email,
            location: userData.location || '',
            role: userData.role,
            profile_pic_url: userData.profile_pic_url || '',
        };

        res.status(200).json({
            message: 'Välkommen in!',
            session: data.session,
            user: normalizedUser,
        });
    } catch (err) {
        console.error('loginUser fel:', err);
        res.status(500).json({ error: 'Serverfel vid inloggning' });
    }
}

// ─────────────────────────────────────────────
// UTLOGGNING
// ─────────────────────────────────────────────
async function logoutUser(req, res) {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) return res.status(400).json({ error: error.message });
        res.status(200).json({ message: 'Utloggad!' });
    } catch (err) {
        console.error('logoutUser fel:', err);
        res.status(500).json({ error: 'Serverfel vid utloggning' });
    }
}

// ─────────────────────────────────────────────
// PROFIL — GET
// ─────────────────────────────────────────────
async function getProfile(req, res) {
    const user_id = req.user.id;

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, username, location, role, profile_pic_url')
            .eq('id', user_id)
            .single();

        if (error || !user) return res.status(404).json({ error: 'Profil hittades inte' });

        // Normalisera username
        let profile = {
            id: user.id,
            username: user.username,
            location: user.location,
            role: user.role,
            profile_pic_url: user.profile_pic_url,
        };

        if (user.role === 'barber') {
            const { data: barberProfile } = await supabase
                .from('barber_profiles')
                .select('salon_name, salon_address, city, phone, bio, cover_image, rating, total_reviews')
                .eq('user_id', user_id)
                .single();

            return res.status(200).json({ ...profile, barber: barberProfile || null });
        }

        res.status(200).json(profile);
    } catch (err) {
        console.error('getProfile fel:', err);
        res.status(500).json({ error: 'Serverfel vid profilhämtning' });
    }
}

// ─────────────────────────────────────────────
// PROFIL — UPDATE
// ─────────────────────────────────────────────
async function updateProfile(req, res) {
    const user_id = req.user.id;
    const { username, location, bio, salon_name, salon_address, city, phone, cover_image, profile_pic_url } = req.body;

    try {
        // Build update object for 'users' table
        const userUpdate = {};
        if (username !== undefined) userUpdate.username = username;
        if (location !== undefined) userUpdate.location = location;
        if (profile_pic_url !== undefined) userUpdate.profile_pic_url = profile_pic_url;

        if (Object.keys(userUpdate).length > 0) {
            const { error: updateError } = await supabase
                .from('users')
                .update(userUpdate)
                .eq('id', user_id);

            if (updateError) return res.status(400).json({ error: updateError.message });
        }

        // Check if we need to update 'barber_profiles'
        const barberUpdate = {};
        if (salon_name !== undefined) barberUpdate.salon_name = salon_name;
        if (salon_address !== undefined) barberUpdate.salon_address = salon_address;
        if (city !== undefined) barberUpdate.city = city;
        if (phone !== undefined) barberUpdate.phone = phone;
        if (bio !== undefined) barberUpdate.bio = bio;
        if (cover_image !== undefined) barberUpdate.cover_image = cover_image;

        if (Object.keys(barberUpdate).length > 0) {
            const { error: barberError } = await supabase
                .from('barber_profiles')
                .update(barberUpdate)
                .eq('user_id', user_id);

            if (barberError) {
                console.warn('barber_profiles update warning:', barberError.message);
            }
        }

        res.status(200).json({ message: 'Profil uppdaterad!' });
    } catch (err) {
        console.error('updateProfile fel:', err);
        res.status(500).json({ error: 'Serverfel vid profiluppdatering' });
    }
}

// ─────────────────────────────────────────────
// OAUTH SYNC — Skapar konto i DB om det saknas
// ─────────────────────────────────────────────
async function oauthSync(req, res) {
    const authUser = req.user; // Kommer från protect-middlewaren (getUser)
    const user_id = authUser.id;

    try {
        // Kontrollera om användaren redan finns i databasen
        const { data: user, error: fetchErr } = await supabase
            .from('users')
            .select('id, username, location, role, profile_pic_url')
            .eq('id', user_id)
            .single();

        if (user && !fetchErr) {
            return res.status(200).json({
                message: 'Konto fanns redan',
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    profile_pic_url: user.profile_pic_url,
                    location: user.location
                }
            });
        }

        // Konto fanns inte — hämta data från authUser
        const meta = authUser.user_metadata || {};
        const username = meta.full_name || meta.name || authUser.email?.split('@')[0] || 'Kund';
        const avatarUrl = meta.avatar_url || meta.picture || '';

        // Skapa den nya användaren
        const { error: insertErr } = await supabase.from('users').insert([{
            id: user_id,
            username: username,
            role: 'customer', // OAuth blir by default customers
            profile_pic_url: avatarUrl,
            location: ''
        }]);

        if (insertErr) {
            console.error('oauthSync insert fel:', insertErr.message);
            return res.status(500).json({ error: 'Kunde inte skapa användare' });
        }

        res.status(201).json({
            message: 'Konto skapades från OAuth',
            user: {
                id: user_id,
                username: username,
                role: 'customer',
                profile_pic_url: avatarUrl,
                location: ''
            }
        });
    } catch (err) {
        console.error('oauthSync serverfel:', err);
        res.status(500).json({ error: 'Serverfel vid OAuth-synk' });
    }
}

module.exports = { registerUser, loginUser, logoutUser, getProfile, updateProfile, oauthSync };