const express = require('express');
const router = express.Router();
const c = require('../controllers/postController');
const { protect, requireBarber } = require('../middleware/authMiddleware');

const barber = [protect, requireBarber];

// ─── Publik ────────────────────────────────────────────────
router.get('/haircuts', c.getAllHaircuts);
router.get('/items', c.getAllItems);

// ─── Barbers egna (inkl inaktiva) ─────────────────────────
router.get('/my/haircuts', ...barber, c.getMyHaircuts);
router.get('/my/items', ...barber, c.getMyItems);

// ─── CRUD haircuts ─────────────────────────────────────────
router.post('/haircuts', ...barber, c.createHaircut);
router.put('/haircuts/:id', ...barber, c.updateHaircut);
router.delete('/haircuts/:id', ...barber, c.deleteHaircut);
router.patch('/haircuts/:id/toggle', ...barber, c.toggleHaircut);

// ─── CRUD items ────────────────────────────────────────────
router.post('/items', ...barber, c.createItem);
router.put('/items/:id', ...barber, c.updateItem);
router.delete('/items/:id', ...barber, c.deleteItem);
router.patch('/items/:id/toggle', ...barber, c.toggleItem);

// ─── Markera bokning utförd ────────────────────────────────
router.patch('/bookings/:id/complete', ...barber, c.completeBooking);

module.exports = router;
