const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    AuthController.login
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', protect, AuthController.getMe);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate password reset token
 * @access  Public
 */
router.post(
    '/forgot-password',
    [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
    AuthController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
    '/reset-password',
    [
        body('token').notEmpty().withMessage('Reset token is required'),
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('New password must be at least 6 characters'),
    ],
    AuthController.resetPassword
);

module.exports = router;
