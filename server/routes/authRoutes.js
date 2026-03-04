const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', authController.registerUser);

// POST /api/auth/login
router.post('/login', authController.loginUser);

// POST /api/auth/logout — kräver inloggning
router.post('/logout', protect, authController.logoutUser);

// GET /api/auth/profile — hämtar inloggad användares profil
router.get('/profile', protect, authController.getProfile);

// PUT /api/auth/profile — uppdaterar profil
router.put('/profile', protect, authController.updateProfile);

module.exports = router;