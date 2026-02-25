const supabase = require('../config/db'); // Hämtar din anslutning till Supabase.

async function registerUser(req, res) { // En asynkron funktion för att skapa användare.
    const { email, password, username, location } = req.body; // Hämtar data som skickas från Thunder Client/Frontend.

    try { // Vi gör ett försök att köra koden.
        // Steg A: Skapa användaren i Supabase Auth (för själva inloggningen)
        const { data: authData, error: authError } = await supabase.auth.signUp({ 
            email: email, 
            password: password 
        }); // Anropar Supabase molntjänst.

        if (authError) { // Om något gick fel med mejl/lösenord...
            return res.status(400).json({ error: authError.message }); // ...skicka tillbaka felet direkt.
        }

        // Steg B: Skapa profilen i din nyskapade 'public.users' tabell
        const { error: dbError } = await supabase.from('users').insert([
            { 
                id: authData.user.id, // Använder det unika ID:t vi nyss fick från Steg A.
                username: username, // Sparar användarnamnet i din tabell.
                location: location, // Sparar platsen i din tabell.
                role: 'customer' // Sätter rollen till kund som standard.
            }
        ]); // Skickar datan till din tabell i Supabase.

        if (dbError) { // Om det blev fel när vi sparade i din tabell...
            return res.status(400).json({ error: dbError.message }); // ...visa vad som gick fel.
        }

        res.status(201).json({ message: 'Succé! Användare och profil skapad.' }); // Skickar tillbaka ett glatt meddelande till dig!

    } catch (err) { // Fångar upp om något annat oväntat kraschar.
        res.status(500).json({ error: 'Något gick fel på servern' }); 
    }
}

module.exports = { registerUser }; // Exporterar funktionen så att Routes kan använda den.