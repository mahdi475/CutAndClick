const app = require('./app');
const supabase = require('./config/db.js');

const PORT = 3000;


async function verifyDb() {
    const { data, error } = await supabase.from('users').select('*').limit(1);

    if (error) {
        console.log('Databas inte ansluten' + error.message);
    } else {
        console.log('Databas ansluten Backend har kontakt med Supabase');
    }
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    verifyDb();
});