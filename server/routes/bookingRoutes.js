const express = require('express');
const router = express.Router();
const {
    getAvailableSlots,
    createBooking,
    getUserBookings,
    cancelBooking,
    getBarberBookings,
} = require('../controllers/bookingController');
const { protect, requireBarber } = require('../middleware/authMiddleware');

// GET /api/bookings/available/:haircutId?date=YYYY-MM-DD — publik
router.get('/available/:haircutId', getAvailableSlots);

// GET /api/bookings/my — kundens bokningar
router.get('/my', protect, getUserBookings);

// GET /api/bookings/barber — barbers bokningar (kräver barber-roll)
router.get('/barber', protect, requireBarber, getBarberBookings);

// POST /api/bookings — skapa bokning (kräver inloggning)
router.post('/', protect, createBooking);

// PATCH /api/bookings/:id/cancel — avboka
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;
