const express = require('express');
const { body } = require('express-validator');
const AffiliateController = require('../controllers/affiliateController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ============================================
// Public Route — Click Tracking (no auth)
// ============================================
router.post('/track/:code', AffiliateController.trackClick);

// All other affiliate routes require authentication
router.use(protect);

// ============================================
// Dashboard
// ============================================
router.get('/dashboard', authorize('affiliate'), AffiliateController.getDashboard);

// ============================================
// Referral Links
// ============================================
router.get('/referral-links', authorize('affiliate'), AffiliateController.getReferralLinks);
router.post(
    '/referral-links',
    authorize('affiliate'),
    [body('slug').optional().trim().isLength({ min: 3 }).withMessage('Slug must be at least 3 characters')],
    AffiliateController.generateReferralLink
);

// ============================================
// Click Tracking History
// ============================================
router.get('/clicks', authorize('affiliate'), AffiliateController.getClicks);

// ============================================
// Funnel Stats
// ============================================
router.get('/funnel', authorize('affiliate'), AffiliateController.getFunnelStats);

// ============================================
// Earnings & Payouts
// ============================================
router.get('/earnings', authorize('affiliate'), AffiliateController.getEarnings);
router.get('/payouts', authorize('affiliate'), AffiliateController.getPayouts);

router.post(
    '/payouts',
    authorize('affiliate'),
    [
        body('amount').isFloat({ min: 10 }).withMessage('Minimum payout amount is $10'),
        body('paymentMethod')
            .optional()
            .isIn(['bank_transfer', 'crypto', 'e_wallet'])
            .withMessage('Invalid payment method'),
        body('paymentDetails').optional().trim(),
    ],
    AffiliateController.requestPayout
);

// ============================================
// Marketing Assets
// ============================================
router.get('/assets', authorize('affiliate'), AffiliateController.getMarketingAssets);

// ============================================
// Settings
// ============================================
router.put('/settings/profile', authorize('affiliate'), AffiliateController.updateProfile);

router.put(
    '/settings/password',
    authorize('affiliate'),
    [
        body('currentPassword').notEmpty().withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('New password must be at least 6 characters'),
    ],
    AffiliateController.changePassword
);

module.exports = router;
