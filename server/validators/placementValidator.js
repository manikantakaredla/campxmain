const { body } = require('express-validator');

exports.validatePlacementRecord = [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('package').isNumeric().withMessage('Package must be a number'),
  body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
  body('studentName').trim().notEmpty().withMessage('Student name is required'),
  body('placementYear').isNumeric().withMessage('Placement year is required'),
  body('offerType').isIn(['Placement', 'Internship', 'PPO']).withMessage('Invalid offer type')
];
