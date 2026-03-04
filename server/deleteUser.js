require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function deleteOrphan() {
    console.log("Fetching users...");
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error("Error fetching users:", error);
        return;
    }

    const alex = users.find(u => u.email === 'alexveklund@gmail.com');
    if (alex) {
        console.log(`Found orphaned user ${alex.id}. Deleting...`);
        const { error: delError } = await supabase.auth.admin.deleteUser(alex.id);
        if (delError) console.error("Error deleting:", delError);
        else console.log("Successfully deleted orphaned user.");
    } else {
        console.log("No orphaned user found.");
    }
}

deleteOrphan();
