const express = require('express');
const router = express.Router();
const { getNotifications, markRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.patch('/read-all', protect, markAllRead);      // Specifik route FÖRE /:id
router.patch('/:id', protect, markRead);

module.exports = router;
