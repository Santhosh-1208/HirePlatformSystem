const { body, query, param, validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: 'Validation failed',
            details: errors.array() 
        });
    }
    next();
}

const jobSearchValidator = [
    query('search')
        .optional()
        .trim()
        .escape()
        .isLength({ max: 200 })
        .withMessage('Search query too long'),
    query('category')
        .optional()
        .trim()
        .escape()
        .isLength({ max: 100 })
        .withMessage('Category too long'),
    handleValidationErrors
];

const offerValidator = [
    body('salary_offered')
        .isFloat({ min: 15000 })
        .withMessage('Salary must be at least 15000 (minimum wage)'),
    body('application_id')
        .isInt({ min: 1 })
        .withMessage('Valid application ID required'),
    handleValidationErrors
];

const applicationValidator = [
    body('job_id')
        .isInt({ min: 1 })
        .withMessage('Valid job ID required'),
    body('applicant_id')
        .isInt({ min: 1 })
        .withMessage('Valid applicant ID required'),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    jobSearchValidator,
    offerValidator,
    applicationValidator
};
