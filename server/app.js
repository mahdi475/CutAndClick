const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Backend fungerar!' });
});

function sayHello(name) {
    console.log('Hello from' + name)
}

sayHello('Madi')


module.exports = app;
