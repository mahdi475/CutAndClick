// auth: register, login, logout, profil, oauth-sync
const { createClient } = require('@supabase/supabase-js');
const supabase = require('../config/db');

// registrering bror
async function registerUser(req, res) {
    const { email, password, username, location, role, salon_name, salon_address, city, phone } = req.body;

    const validRole = role === 'barber' ? 'barber' : 'customer';

    try {
        // temp klient så vi inte smutsar ner admin-klienten type shit
        const tempSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
            auth: { persistSession: false }
        });

        // 1. skapa supabase auth-konto
        let authData, authError;
        const signupRes = await tempSupabase.auth.signUp({
            email,
            password,
            options: {
                data: { role: validRole } // sparar rollen i metadata, snabbare sen yani
            }
        });
        authData = signupRes.data;
        authError = signupRes.error;

        // fallback om rate limit smäller, kör admin api istället
        if (authError && authError.message.includes('rate limit')) {
            console.log("Rate limit hit during signUp, forcing creation via admin API...");
            const adminRes = await supabase.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true
            });

            if (adminRes.error) {
                authError = adminRes.error;
            } else {
                authData = { user: adminRes.data.user, session: null };
                authError = null;
            }
        }

        if (authError) {
            console.error("SUPABASE AUTH SIGNUP ERROR:", authError.message);
            return res.status(400).json({ error: authError.message });
        }

        console.log("DEBUG REGISTRATION AUTHDATA:", authData);
        const userId = authData.user.id;

        // 2. stoppa in i users-tabellen
        const userLocation = location || city || '';
        const { error: dbError } = await supabase.from('users').insert([{
            id: userId,
            username: username,
            location: userLocation,
            role: validRole,
        }]);

        if (dbError) {
            console.error("USERS TABLE INSERT ERROR:", dbError.message);
            if (dbError.code === '23505') {
                if (dbError.message.includes('users_username_key')) {
                    return res.status(400).json({ error: 'Detta användarnamn är redan upptaget.' });
                }
                if (dbError.message.includes('users_pkey') || dbError.message.includes('users_id_key')) {
                    return res.status(400).json({ error: 'Ett konto med denna e-post finns redan. Vänligen logga in istället, eller verifiera din e-post.' });
                }
                return res.status(400).json({ error: 'Ett konto med dessa uppgifter finns redan.' });
            }
            return res.status(400).json({ error: dbError.message });
        }

        // 3. om barber, spara i barber_profiles med
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

// inloggning mannen
async function loginUser(req, res) {
    const { email, password } = req.body;

    try {
        // ny temp klient igen, vill inte störa admin-klienten ykwim
        const tempSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
            auth: { persistSession: false }
        });

        const { data, error } = await tempSupabase.auth.signInWithPassword({ email, password });
        if (error) {
            console.error("SUPABASE LOGIN ERROR:", error);
            if (error.message.toLowerCase().includes('confirm')) {
                return res.status(401).json({ error: 'Vänligen bekräfta din e-postadress i mejlet som skickades till dig innan du försöker logga in igen.' });
            }
            return res.status(401).json({ error: 'Fel mejl eller lösenord. DB-svar: ' + error.message });
        }

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, username, location, role, profile_pic_url')
            .eq('id', data.user.id)
            .single();

        if (userError || !userData) {
            console.error("LOGIN DB FETCH ERROR:", userError, "DATA:", userData, "USER ID:", data.user.id);
            return res.status(404).json({ error: 'Konto-profil saknas i databasen' });
        }

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

// logga ut ba
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

// hämta profil
async function getProfile(req, res) {
    const user_id = req.user.id;

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, username, location, role, profile_pic_url')
            .eq('id', user_id)
            .single();

        if (error || !user) return res.status(404).json({ error: 'Profil hittades inte' });

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

// uppdatera profil
async function updateProfile(req, res) {
    const user_id = req.user.id;
    const { username, location, bio, salon_name, salon_address, city, phone, cover_image, profile_pic_url } = req.body;

    try {
        // bygger update-objekt för users
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

        // kolla om barber_profiles behöver uppdateras med
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

// oauth sync - skapar konto i db om det inte finns, fr fr
async function oauthSync(req, res) {
    const authUser = req.user;
    const user_id = authUser.id;

    try {
        // kolla om usern redan finns
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

        // finns inte, hämta data från auth och skapa
        const meta = authUser.user_metadata || {};
        const username = meta.full_name || meta.name || authUser.email?.split('@')[0] || 'Kund';
        const avatarUrl = meta.avatar_url || meta.picture || '';

        const { error: insertErr } = await supabase.from('users').insert([{
            id: user_id,
            username: username,
            role: 'customer', // oauth = customer by default
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