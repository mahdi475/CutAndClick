require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function nukeUser() {
    console.log("Fetching auth users...");
    const { data: { users } } = await supabase.auth.admin.listUsers();

    // Nuke all auth accounts matching email
    const alexes = users.filter(u => u.email === 'alexveklund@gmail.com');
    for (const u of alexes) {
        console.log("Deleting Auth user:", u.id);
        await supabase.auth.admin.deleteUser(u.id);
    }

    console.log("Fetching public users named alex...");
    const { data: pubUsers } = await supabase.from('users').select('*').eq('username', 'alex');
    if (pubUsers) {
        for (const u of pubUsers) {
            console.log("Deleting Public user:", u.id);
            await supabase.from('users').delete().eq('id', u.id);
            await supabase.from('barber_profiles').delete().eq('user_id', u.id);
        }
    }
    console.log("Wipe complete.");
}
nukeUser();
