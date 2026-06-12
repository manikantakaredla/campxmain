const { body } = require('express-validator');

exports.validateInterviewExperience = [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('year').isNumeric().withMessage('Year is required'),
  body('rounds').optional().isArray().withMessage('Rounds must be an array'),
  body('difficultyLevel').optional().isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty level')
];

exports.validateExperienceApproval = [
  body('status').isIn(['Approved', 'Rejected']).withMessage('Invalid status')
];
