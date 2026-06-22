const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

router.use(protect);

router.get('/conversations', chatController.getConversations);
router.get('/messages', chatController.getMessages);
router.post('/messages', chatController.sendMessage);
router.post('/read', chatController.markAsRead);

module.exports = router;
