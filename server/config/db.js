// supabase-klient med admin-access
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// använd service_role-nyckeln om den finns och inte är en platshållare
const supabaseKey = (serviceKey && serviceKey !== 'YOUR_SERVICE_ROLE_KEY_HERE')
    ? serviceKey
    : process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    }
});

module.exports = supabase;
