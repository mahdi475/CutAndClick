const express = require('express'); // Hämtar Express.
const router = express.Router(); // Skapar en router-modul.
const authController = require('../controllers/authController'); // Hämtar logiken vi nyss skrev.

// Kopplar adressen /register till funktionen registerUser:
router.post('/register', authController.registerUser); 

module.exports = router; // Exporterar vägvisaren.