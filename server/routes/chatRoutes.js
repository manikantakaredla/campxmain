const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

router.use(protect);

router.get('/conversations', chatController.getConversations);
router.get('/messages', chatController.getMessages);
router.post('/messages', chatController.sendMessage);
router.post('/read', chatController.markAsRead);
router.delete('/messages/:id', chatController.deleteMessage);
router.delete('/conversations/:id', chatController.deleteConversation);
router.delete('/conversations/group/:id', chatController.deleteGroupConversation);

// Poll routes
router.post('/messages/:id/vote', chatController.votePoll);
router.get('/messages/:id/poll-stats', chatController.getPollStats);

module.exports = router;
