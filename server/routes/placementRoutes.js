const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/temp/' });
const placementController = require('../controllers/placementController');
const { validatePlacementRecord } = require('../validators/placementValidator');

router.use(protect);

// Student & Public facing
router.get('/', placementController.getPlacements);
router.get('/statistics', placementController.getPlacementStatistics);
router.get('/statistics/trends', placementController.getSalaryTrends);

// Admin only routes
router.use(authorizeRoles('admin', 'management', 'placement_coordinator'));

router.get('/template', placementController.downloadTemplate);
router.post('/upload', upload.single('file'), placementController.uploadPlacements);
router.post('/', validatePlacementRecord, placementController.createPlacement);
router.put('/:id', validatePlacementRecord, placementController.updatePlacement);
router.delete('/:id', placementController.deletePlacement);

module.exports = router;
