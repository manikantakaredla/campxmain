const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const successStoryController = require('../controllers/successStoryController');

router.use(protect);

router.get('/', successStoryController.getStories);
router.get('/:id', successStoryController.getStoryById);

// Admin / Management / Coordinator routes
router.use(authorizeRoles('admin', 'management', 'placement_coordinator'));
router.post('/', successStoryController.createStory);
router.put('/:id', successStoryController.updateStory);
router.delete('/:id', successStoryController.deleteStory);

module.exports = router;
