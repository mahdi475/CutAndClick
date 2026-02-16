const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Backend fungerar!' });
});

function sayHello(name) {
    console.log('Hello from' + name)
}

sayHello('Madi')


module.exports = app;
