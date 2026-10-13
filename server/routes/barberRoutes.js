// barber-routes: alla, sök, nära, specifik
const express = require('express');
const router = express.Router();
const {
    getAllBarbers,
    searchBarbers,
    getNearbyBarbers,
    getBarberById,
} = require('../controllers/barberController');
const { optionalProtect } = require('../middleware/authMiddleware');

// specifika routes före :id, annars matchar fel route
router.get('/search', optionalProtect, searchBarbers);
router.get('/nearby', optionalProtect, getNearbyBarbers);
router.get('/', optionalProtect, getAllBarbers);
router.get('/:id', optionalProtect, getBarberById);

module.exports = router;
