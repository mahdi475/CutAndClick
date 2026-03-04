const express = require('express');
const router = express.Router();
const {
    getAllBarbers,
    searchBarbers,
    getNearbyBarbers,
    getBarberById,
} = require('../controllers/barberController');

// VIKTIGT: specifika routes MÅSTE komma före :id-parametern
// GET /api/barbers/search?q=xxx
router.get('/search', searchBarbers);

// GET /api/barbers/nearby?city=xxx
router.get('/nearby', getNearbyBarbers);

// GET /api/barbers — alla barbers
router.get('/', getAllBarbers);

// GET /api/barbers/:id — specifik barber med allt
router.get('/:id', getBarberById);

module.exports = router;
