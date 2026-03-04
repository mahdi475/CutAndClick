require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPublicUsers() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        console.error("ERROR FETCHING PUBLIC USERS:", error);
    } else {
        console.log("PUBLIC USERS:");
        console.log(data);
    }
}

checkPublicUsers();
