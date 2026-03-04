const express = require('express');
const router = express.Router();
const { getFavourites, addFavourite, removeFavourite } = require('../controllers/favouriteController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getFavourites);
router.post('/', protect, addFavourite);
router.delete('/:barberId', protect, removeFavourite);

module.exports = router;
