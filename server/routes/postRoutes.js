// post-routes: haircuts, items, crud
const express = require('express');
const router = express.Router();
const c = require('../controllers/postController');
const { protect, requireBarber } = require('../middleware/authMiddleware');

const barber = [protect, requireBarber];

// publikt
router.get('/haircuts', c.getAllHaircuts);
router.get('/items', c.getAllItems);

// barberns egna grejer
router.get('/my/haircuts', ...barber, c.getMyHaircuts);
router.get('/my/items', ...barber, c.getMyItems);

// crud klippningar
router.post('/haircuts', ...barber, c.createHaircut);
router.put('/haircuts/:id', ...barber, c.updateHaircut);
router.delete('/haircuts/:id', ...barber, c.deleteHaircut);
router.patch('/haircuts/:id/toggle', ...barber, c.toggleHaircut);

// crud produkter
router.post('/items', ...barber, c.createItem);
router.put('/items/:id', ...barber, c.updateItem);
router.delete('/items/:id', ...barber, c.deleteItem);
router.patch('/items/:id/toggle', ...barber, c.toggleItem);

// markera bokning klar
router.patch('/bookings/:id/complete', ...barber, c.completeBooking);

module.exports = router;
