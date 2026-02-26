const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/bookings/available/:haircutId?date=YYYY-MM-DD — publik
router.get('/available/:haircutId', bookingController.getAvailableSlots);

// POST /api/bookings — kräver inloggning
router.post('/', protect, bookingController.createBooking);

// GET /api/bookings/my — hämtar den inloggade kundens bokningar
router.get('/my', protect, bookingController.getUserBookings);

module.exports = router;
