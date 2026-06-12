const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validate = require('../middleware/validationMiddleware');
const { validateInterviewExperience, validateExperienceApproval } = require('../validators/interviewValidator');
const interviewController = require('../controllers/interviewController');

router.use(protect);

// Student fetching (only approved ones should be returned here normally)
router.get('/', interviewController.getExperiences);
router.get('/:id', interviewController.getExperienceById);

// Student submitting an experience
router.post('/', validateInterviewExperience, validate, interviewController.submitExperience);

// Admin / Management / Coordinator routes
router.put('/:id/approve', authorizeRoles('admin', 'management', 'placement_coordinator'), validateExperienceApproval, validate, interviewController.approveExperience);
router.delete('/:id', authorizeRoles('admin', 'management', 'placement_coordinator'), interviewController.deleteExperience);

module.exports = router;
