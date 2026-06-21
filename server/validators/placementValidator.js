const { body } = require('express-validator');

exports.validatePlacementRecord = [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('package').isNumeric().withMessage('Package must be a number'),
  body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
  body('studentName').trim().notEmpty().withMessage('Student name is required'),
  body('placementYear').isNumeric().withMessage('Placement year is required'),
  body('offerType').isIn(['Placement', 'Internship', 'PPO']).withMessage('Invalid offer type'),
  body('linkedinUrl')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      const regex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_\-\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\/|\?|$)/i;
      if (!regex.test(value)) {
        throw new Error('LinkedIn URL must be a valid profile link (e.g., https://www.linkedin.com/in/username)');
      }
      return true;
    })
];
