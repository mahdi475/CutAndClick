const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Enkel hälsningsroute för att testa att servern fungerar
app.get('/', (req, res) => {
    res.json({ message: 'Backend fungerar!' });
});

module.exports = app;
