const { body, query, param } = require('express-validator');

exports.validateOpportunity = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('type').isIn(['Placement Drive', 'Internship', 'Hackathon', 'Job Opportunity', 'Workshop', 'Certification', 'Competition', 'Research Opportunity']).withMessage('Invalid opportunity type'),
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  body('visibility').optional().isIn(['Public', 'Internal']),
  body('registrationDeadline').optional({ checkFalsy: true }).isISO8601().toDate().withMessage('Invalid registration deadline date'),
  body('eventDate').optional({ checkFalsy: true }).isISO8601().toDate().withMessage('Invalid event date'),
  body('eligibility').optional({ checkFalsy: true }).isObject(),
  body('eligibility.branches').optional({ checkFalsy: true }).isArray(),
  body('eligibility.sections').optional({ checkFalsy: true }).isArray(),
  body('eligibility.years').optional({ checkFalsy: true }).isArray(),
  body('eligibility.cgpa').optional({ checkFalsy: true }).isNumeric()
];

exports.validateApplication = [
  param('id').isMongoId().withMessage('Valid Opportunity ID is required')
];

exports.validateSavedOpportunity = [
  param('id').isMongoId().withMessage('Valid Opportunity ID is required')
];
