const { validationResult } = require('express-validator');
const AffiliateService = require('../services/affiliateService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Affiliate Controller
 * Handles all Affiliate Panel HTTP requests
 */
class AffiliateController {
    /**
     * GET /api/affiliate/dashboard
     */
    static async getDashboard(req, res, next) {
        try {
            const stats = await AffiliateService.getDashboardStats(req.user.id);
            return successResponse(res, 200, 'Dashboard data retrieved', stats);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * GET /api/affiliate/referral-links
     */
    static async getReferralLinks(req, res, next) {
        try {
            const result = await AffiliateService.getReferralLinks(req.user.id);
            return successResponse(res, 200, 'Referral links retrieved', result);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * POST /api/affiliate/referral-links
     */
    static async generateReferralLink(req, res, next) {
        try {
            const result = await AffiliateService.generateReferralLink(req.user.id, req.body.slug);
            return successResponse(res, 201, 'Referral link generated', result);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * POST /api/affiliate/track/:code
     * Public endpoint — tracks a click on referral link
     */
    static async trackClick(req, res, next) {
        try {
            const ip = req.ip || req.connection.remoteAddress || '0.0.0.0';
            const userAgent = req.get('User-Agent') || '';
            const click = await AffiliateService.trackClick(req.params.code, ip, userAgent);
            return successResponse(res, 201, 'Click tracked', { clickId: click._id });
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * GET /api/affiliate/clicks
     */
    static async getClicks(req, res, next) {
        try {
            const result = await AffiliateService.getClicks(req.user.id, req.query);
            return successResponse(res, 200, 'Click history retrieved', result);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * GET /api/affiliate/funnel
     */
    static async getFunnelStats(req, res, next) {
        try {
            const result = await AffiliateService.getFunnelStats(req.user.id);
            return successResponse(res, 200, 'Funnel stats retrieved', result);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * GET /api/affiliate/earnings
     */
    static async getEarnings(req, res, next) {
        try {
            const result = await AffiliateService.getEarnings(req.user.id, req.query);
            return successResponse(res, 200, 'Earnings retrieved', result);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * GET /api/affiliate/payouts
     */
    static async getPayouts(req, res, next) {
        try {
            const result = await AffiliateService.getPayouts(req.user.id, req.query);
            return successResponse(res, 200, 'Payouts retrieved', result);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * POST /api/affiliate/payouts
     */
    static async requestPayout(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation failed', errors.array());
            }

            const payout = await AffiliateService.requestPayout(req.user.id, req.body);
            return successResponse(res, 201, 'Payout request submitted', payout);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * GET /api/affiliate/assets
     */
    static async getMarketingAssets(req, res, next) {
        try {
            const assets = await AffiliateService.getMarketingAssets();
            return successResponse(res, 200, 'Marketing assets retrieved', assets);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/affiliate/settings/profile
     */
    static async updateProfile(req, res, next) {
        try {
            const result = await AffiliateService.updateProfile(req.user.id, req.body);
            return successResponse(res, 200, 'Profile updated', result);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * PUT /api/affiliate/settings/password
     */
    static async changePassword(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation failed', errors.array());
            }

            const { currentPassword, newPassword } = req.body;
            const result = await AffiliateService.changePassword(req.user.id, currentPassword, newPassword);
            return successResponse(res, 200, result.message);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }
}

module.exports = AffiliateController;
