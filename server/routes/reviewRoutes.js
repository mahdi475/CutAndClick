const express = require('express');
const router = express.Router();
const { getReviews, createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:barberId', getReviews);            // publik
router.post('/', protect, createReview);  // kräver inloggning

module.exports = router;
