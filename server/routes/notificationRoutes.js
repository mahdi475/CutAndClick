// notis-routes
const express = require('express');
const router = express.Router();
const { getNotifications, markRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.patch('/read-all', protect, markAllRead); // specifik route före /:id
router.patch('/:id', protect, markRead);

module.exports = router;
