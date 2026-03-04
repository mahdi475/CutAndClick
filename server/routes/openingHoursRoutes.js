const express = require('express');
const router = express.Router();
const { getOpeningHours, updateOpeningHours } = require('../controllers/openingHoursController');
const { protect, requireBarber } = require('../middleware/authMiddleware');

// GET /api/opening-hours/:userId — publik (gäster kan se öppettider)
router.get('/:userId', getOpeningHours);

// PUT /api/opening-hours — kräver inloggning och barber-roll
router.put('/', protect, requireBarber, updateOpeningHours);

module.exports = router;
