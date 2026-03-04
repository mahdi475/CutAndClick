const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const openingHoursRoutes = require('./routes/openingHoursRoutes');
const barberRoutes = require('./routes/barberRoutes');
const favouriteRoutes = require('./routes/favouriteRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// ─────────────────────────────────────────────
// CORS — tillåt frontend (lokal dev + produktion)
// ─────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL,           // https://cutandclick.vercel.app i produktion
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Tillåt requests utan origin (t.ex. Postman / mobilapp)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS blockerat: okänd origin'));
        }
    },
    credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/opening-hours', openingHoursRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

// ─────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ message: 'Cut & Click API — fungerar! ✂️', version: '1.0.0' });
});

// ─────────────────────────────────────────────
// Global error handler
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('[Global Error]', err.message);
    if (err.message?.includes('CORS')) {
        return res.status(403).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internt serverfel' });
});

module.exports = app;
