const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validate = require('../middleware/validationMiddleware');
const { validateOpportunity, validateApplication, validateSavedOpportunity } = require('../validators/opportunityValidator');
const opportunityController = require('../controllers/opportunityController');

// All endpoints require authentication
router.use(protect);

// Basic CRUD
router.get('/', opportunityController.getOpportunities);
router.get('/:id', opportunityController.getOpportunityById);

// Admin / Management / Coordinator specific routes
router.post('/', authorizeRoles('admin', 'management', 'placement_coordinator'), validateOpportunity, validate, opportunityController.createOpportunity);
router.put('/:id', authorizeRoles('admin', 'management', 'placement_coordinator'), validateOpportunity, validate, opportunityController.updateOpportunity);
router.delete('/:id', authorizeRoles('admin', 'management', 'placement_coordinator'), opportunityController.deleteOpportunity); // Soft delete
router.post('/:id/restore', authorizeRoles('admin', 'management', 'placement_coordinator'), opportunityController.restoreOpportunity);

// Admin Application Management
router.patch('/applications/:appId/status', authorizeRoles('admin', 'management', 'placement_coordinator'), opportunityController.updateApplicationStatus);

// Student facing application & bookmark routes
router.post('/:id/apply', validateApplication, validate, opportunityController.applyForOpportunity);
router.post('/:id/save', validateSavedOpportunity, validate, opportunityController.saveOpportunity);
router.delete('/:id/save', opportunityController.removeSavedOpportunity);

// Analytics (Admin only)
router.get('/:id/analytics', authorizeRoles('admin', 'management', 'placement_coordinator'), opportunityController.getOpportunityAnalytics);

module.exports = router;
