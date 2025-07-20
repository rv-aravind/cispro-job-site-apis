// middleware/validators.js
import { body, validationResult } from 'express-validator';

export const validateCompanyProfile = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('website').optional().isURL().withMessage('Website must be valid URL'),
  body('teamSize').optional().isString(),
  body('aboutCompany').optional().isString().isLength({ max: 2000 }),
  // Add more validations as needed...

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];
