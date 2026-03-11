const fs = require('fs');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testLogin() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const email = 'Firat05_@hotmail.com';
    const password = 'password123';

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        fs.writeFileSync('output.txt', JSON.stringify({ error, data }, null, 2), 'utf-8');
    } catch (e) {
        fs.writeFileSync('output.txt', e.toString(), 'utf-8');
    }
}
testLogin();
