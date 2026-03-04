require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUser() {
    const { data: users, error } = await supabase.from('users').select('*');
    if (error) console.error('Error fetching users:', error);
    else console.log('All Users:', users);
}
checkUser();
