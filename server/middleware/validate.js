// server/middleware/validate.js
// Input-validering med express-validator
const { body, validationResult } = require('express-validator');

// ── Hjälpare: returnera fel om validering failar ───────────────
function handleValidation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array()[0].msg,   // Returnera första felet
            details: errors.array(),
        });
    }
    next();
}

// ── registerUser ───────────────────────────────────────────────
const validateRegister = [
    body('email')
        .isEmail()
        .withMessage('Ogiltig e-postadress'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Lösenordet måste vara minst 6 tecken'),
    body('username')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Användarnamn måste vara 2–50 tecken'),
    body('role')
        .isIn(['customer', 'barber'])
        .withMessage('Roll måste vara customer eller barber'),
    handleValidation,
];

// ── createBooking ──────────────────────────────────────────────
const validateBooking = [
    body('haircut_id')
        .notEmpty()
        .withMessage('haircut_id krävs'),
    body('booking_date')
        .isDate()
        .withMessage('booking_date måste vara ett giltigt datum (YYYY-MM-DD)')
        .custom(value => {
            const today = new Date(); today.setHours(0, 0, 0, 0);
            if (new Date(value) < today) throw new Error('Datumet måste vara i framtiden');
            return true;
        }),
    body('booking_time')
        .matches(/^([0-1]?\d|2[0-3]):([0-5]\d)$/)
        .withMessage('booking_time måste vara i formatet HH:MM'),
    handleValidation,
];

// ── createReview ───────────────────────────────────────────────
const validateReview = [
    body('barber_id')
        .notEmpty()
        .withMessage('barber_id krävs'),
    body('stars')
        .isInt({ min: 1, max: 5 })
        .withMessage('Stars måste vara 1–5'),
    body('review_title')
        .optional()
        .isLength({ max: 80 })
        .withMessage('Rubrik max 80 tecken'),
    body('review_description')
        .optional()
        .isLength({ min: 10, max: 500 })
        .withMessage('Beskrivning måste vara 10–500 tecken'),
    handleValidation,
];

// ── createHaircut / createItem ─────────────────────────────────
const validateHaircut = [
    body('title')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Titel måste vara 2–100 tecken'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Pris måste vara ett positivt tal'),
    body('duration_minutes')
        .optional()
        .isInt({ min: 5, max: 480 })
        .withMessage('Varaktighet måste vara 5–480 minuter'),
    handleValidation,
];

module.exports = { validateRegister, validateBooking, validateReview, validateHaircut };
