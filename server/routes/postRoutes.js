const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// GET http://localhost:3000/api/posts/haircuts — publik, ingen token krävs
router.get('/haircuts', postController.getAllHaircuts);

// GET http://localhost:3000/api/posts/items — publik, ingen token krävs
router.get('/items', postController.getAllItems);

module.exports = router;
