const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// GET http://localhost:3000/api/posts/haircuts — publik
router.get('/haircuts', postController.getAllHaircuts);

// GET http://localhost:3000/api/posts/items — publik
router.get('/items', postController.getAllItems);

// POST http://localhost:3000/api/posts/haircuts — kräver inloggning
router.post('/haircuts', protect, postController.createHaircut);

module.exports = router;
