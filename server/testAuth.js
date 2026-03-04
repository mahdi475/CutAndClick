require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAuthUsers() {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error("Error fetching auth users:", error);
    } else {
        console.log("Auth Users:");
        users.forEach(u => console.log(`${u.email} - ${u.id}`));
    }
}
checkAuthUsers();
