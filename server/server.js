// startar servern, kollar db-connection
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

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
verifyDb();

// hämtar dörrvakten bro
const { protect } = require('./middleware/authMiddleware');

// test-route, ba inloggade slipper in
app.get('/api/test-hidden', protect, (req, res) => {
    // om du e här så släppte protect dig, safe
    res.json({
        message: 'Du är inloggad och dörrvakten släppte in dig!',
        din_info: req.user
    });
});