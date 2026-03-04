require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY); // using anon key like the frontend/backend

async function testLogin() {
    const email = 'alexveklund@gmail.com';
    const password = 'password123'; // or whatever, we don't need real password if we skip signIn, but let's try to just select first.

    console.log("Selecting with anon key:");
    const { data: anonData, error: anonError } = await supabase
        .from('users')
        .select('*')
        .eq('id', '6ea4b650-c526-439b-8d9c-4b4e7a22bc0c')
        .single();

    console.log("Anon select:", anonData, anonError);
}
testLogin();
