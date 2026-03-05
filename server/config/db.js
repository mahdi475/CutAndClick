const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Använd service_role key på backend om den finns och inte är en placeholder
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
