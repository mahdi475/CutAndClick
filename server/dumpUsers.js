const fs = require('fs');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function dump() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    fs.writeFileSync('users_dump.txt', JSON.stringify({ users, error }, null, 2), 'utf-8');
}
dump();
