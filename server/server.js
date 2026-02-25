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

// Vi hämtar dörrvakten (protect)
const { protect } = require('./middleware/authMiddleware');

// Vi skapar en test-väg som bara inloggade får se
app.get('/api/test-hidden', protect, (req, res) => {
    // Om vi hamnar här betyder det att protect-funktionen körde "next()"
    res.json({ 
        message: 'Du är inloggad och dörrvakten släppte in dig!',
        din_info: req.user // Här ser du din info från Supabase
    });
});