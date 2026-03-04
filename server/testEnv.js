const supabase = require('./config/db');
console.log("Supabase key used starts with:", supabase.supabaseKey ? supabase.supabaseKey.substring(0, 15) : "undefined");
console.log("Process env service key starts with:", process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 15) : "undefined");

async function check() {
    const { data, error } = await supabase.from('users').select('*').eq('id', '6ea4b650-c526-439b-8d9c-4b4e7a22bc0c');
    console.log("Test read with db.js:", data, error);
}

check();
