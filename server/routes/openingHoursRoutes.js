// öppettider-routes
const express = require('express');
const router = express.Router();
const { getOpeningHours, updateOpeningHours } = require('../controllers/openingHoursController');
const { protect, requireBarber } = require('../middleware/authMiddleware');

router.get('/:userId', getOpeningHours);
router.put('/', protect, requireBarber, updateOpeningHours);

module.exports = router;
