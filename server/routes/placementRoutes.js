const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/temp/' });
const placementController = require('../controllers/placementController');

router.use(protect);

// Student & Public facing
router.get('/', placementController.getPlacements);
router.get('/statistics', placementController.getPlacementStatistics);
router.get('/statistics/trends', placementController.getSalaryTrends);

// Admin only routes
router.use(authorizeRoles('admin', 'management', 'placement_coordinator'));

router.get('/template', placementController.downloadTemplate);
router.post('/upload', upload.single('file'), placementController.uploadPlacements);

module.exports = router;
