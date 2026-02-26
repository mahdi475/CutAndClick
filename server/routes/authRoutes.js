const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Adress: POST http://localhost:3000/api/auth/register
router.post('/register', authController.registerUser);

// Adress: POST http://localhost:3000/api/auth/login
router.post('/login', authController.loginUser);

// GET http://localhost:3000/api/auth/profile — kräver inloggning
router.get('/profile', protect, authController.getProfile);

module.exports = router;