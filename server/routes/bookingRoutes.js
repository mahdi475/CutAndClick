// booking-routes: tider, skapa, avboka
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

router.get('/available/:haircutId', getAvailableSlots);
router.get('/my', protect, getUserBookings);
router.get('/barber', protect, requireBarber, getBarberBookings);
router.post('/', protect, createBooking);
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;
