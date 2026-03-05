const express = require('express');
const router = express.Router();
const {
    getAllBarbers,
    searchBarbers,
    getNearbyBarbers,
    getBarberById,
} = require('../controllers/barberController');
const { optionalProtect } = require('../middleware/authMiddleware');

// VIKTIGT: specifika routes MÅSTE komma före :id-parametern
// GET /api/barbers/search?q=xxx
router.get('/search', optionalProtect, searchBarbers);

// GET /api/barbers/nearby?city=xxx
router.get('/nearby', optionalProtect, getNearbyBarbers);

// GET /api/barbers — alla barbers
router.get('/', optionalProtect, getAllBarbers);

// GET /api/barbers/:id — specifik barber med allt
router.get('/:id', optionalProtect, getBarberById);

module.exports = router;
