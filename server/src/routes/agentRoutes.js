const express = require('express');
const { body } = require('express-validator');
const AgentController = require('../controllers/agentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All agent routes require authentication + agent role
router.use(protect);

// ============================================
// Dashboard
// ============================================
router.get('/dashboard', authorize('agent'), AgentController.getDashboard);

// ============================================
// User Management
// ============================================
router.get('/users', authorize('agent'), AgentController.getUsers);

router.post(
    '/users',
    authorize('agent'),
    [
        body('name').notEmpty().trim().withMessage('Player name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('phone').optional().trim(),
        body('country').optional().trim(),
    ],
    AgentController.addUser
);

router.get('/users/:id', authorize('agent'), AgentController.getUserById);
router.patch('/users/:id/status', authorize('agent'), AgentController.toggleUserStatus);

// ============================================
// Commission & Earnings
// ============================================
router.get('/commissions', authorize('agent'), AgentController.getCommissions);
router.get('/commissions/export', authorize('agent'), AgentController.exportCommissions);

// ============================================
// Withdrawals
// ============================================
router.get('/withdrawals', authorize('agent'), AgentController.getWithdrawals);

router.post(
    '/withdrawals',
    authorize('agent'),
    [
        body('amount').isFloat({ min: 10 }).withMessage('Minimum withdrawal amount is $10'),
        body('paymentMethod')
            .optional()
            .isIn(['bank_transfer', 'crypto', 'e_wallet'])
            .withMessage('Invalid payment method'),
        body('paymentDetails').optional().trim(),
    ],
    AgentController.requestWithdrawal
);

// Admin endpoint for withdrawal processing
router.patch(
    '/withdrawals/:id/process',
    authorize('admin'),
    [
        body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
        body('reason').optional().trim(),
    ],
    AgentController.processWithdrawal
);

// ============================================
// Settings
// ============================================
router.put('/settings/profile', authorize('agent'), AgentController.updateProfile);

router.put(
    '/settings/password',
    authorize('agent'),
    [
        body('currentPassword').notEmpty().withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('New password must be at least 6 characters'),
    ],
    AgentController.changePassword
);

module.exports = router;
