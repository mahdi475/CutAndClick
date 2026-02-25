const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Adress: POST http://localhost:3000/api/auth/register
router.post('/register', authController.registerUser);

// Adress: POST http://localhost:3000/api/auth/login
router.post('/login', authController.loginUser);

module.exports = router;