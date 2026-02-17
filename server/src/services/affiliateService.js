const Affiliate = require('../models/Affiliate');
const Click = require('../models/Click');
const Referral = require('../models/Referral');
const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const crypto = require('crypto');

/**
 * Affiliate Service
 * Business logic for affiliate panel operations
 */
class AffiliateService {
    /**
     * Get dashboard statistics for an affiliate
     * @param {string} userId - Affiliate's user ID
     * @returns {Object} Dashboard stats + conversion chart data
     */
    static async getDashboardStats(userId) {
        const affiliate = await Affiliate.findOne({ userId });
        if (!affiliate) throw { statusCode: 404, message: 'Affiliate profile not found' };

        // Get conversion chart data (last 30 days, grouped by week)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const conversionData = await Referral.aggregate([
            {
                $match: {
                    affiliateId: affiliate._id,
                    registeredAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$registeredAt' } },
                    registrations: { $sum: 1 },
                    deposits: { $sum: { $cond: ['$firstDeposit', 1, 0] } },
                    revenue: { $sum: '$revenueGenerated' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Get recent click stats (last 7 days for chart)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const clickData = await Click.aggregate([
            {
                $match: {
                    affiliateId: affiliate._id,
                    timestamp: { $gte: sevenDaysAgo },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                    clicks: { $sum: 1 },
                    conversions: { $sum: { $cond: ['$converted', 1, 0] } },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Fill in missing days for the chart
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayClicks = clickData.find((d) => d._id === dateStr);
            const dayConversions = conversionData.find((d) => d._id === dateStr);
            chartData.push({
                date: dateStr,
                clicks: dayClicks?.clicks || 0,
                registrations: dayConversions?.registrations || 0,
                deposits: dayConversions?.deposits || 0,
                revenue: dayConversions?.revenue || 0,
            });
        }

        const pendingWithdrawals = await Withdrawal.countDocuments({
            userId,
            status: 'pending',
        });

        return {
            totalClicks: affiliate.totalClicks,
            totalRegistrations: affiliate.totalRegistrations,
            totalDeposits: affiliate.totalDeposits,
            totalRevenue: Math.round(affiliate.totalEarnings * 100) / 100,
            withdrawableBalance: Math.round(affiliate.withdrawableBalance * 100) / 100,
            totalWithdrawn: Math.round(affiliate.totalWithdrawn * 100) / 100,
            revenueSharePercent: affiliate.revenueSharePercent,
            referralCode: affiliate.referralCode,
            pendingWithdrawals,
            chartData,
        };
    }

    /**
     * Get all referral links/codes for an affiliate
     * @param {string} userId - Affiliate's user ID
     * @returns {Object} Referral link info
     */
    static async getReferralLinks(userId) {
        const affiliate = await Affiliate.findOne({ userId });
        if (!affiliate) throw { statusCode: 404, message: 'Affiliate profile not found' };

        // Get stats per referral code
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const referralLink = `${baseUrl}/ref/${affiliate.referralCode}`;

        const clickCount = await Click.countDocuments({ affiliateId: affiliate._id });
        const conversionCount = await Click.countDocuments({
            affiliateId: affiliate._id,
            converted: true,
        });

        return {
            referralCode: affiliate.referralCode,
            referralLink,
            totalClicks: clickCount,
            totalConversions: conversionCount,
            conversionRate: clickCount > 0 ? Math.round((conversionCount / clickCount) * 100 * 100) / 100 : 0,
        };
    }

    /**
     * Generate a new unique referral link/code
     * @param {string} userId - Affiliate's user ID
     * @param {string} slug - Optional custom slug
     * @returns {Object} New referral info
     */
    static async generateReferralLink(userId, slug = '') {
        const affiliate = await Affiliate.findOne({ userId });
        if (!affiliate) throw { statusCode: 404, message: 'Affiliate profile not found' };

        // Generate new code: use slug if provided, otherwise random
        const newCode = slug || `REF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // Check uniqueness
        const existing = await Affiliate.findOne({ referralCode: newCode });
        if (existing && existing.userId.toString() !== userId) {
            throw { statusCode: 400, message: 'This referral code is already in use' };
        }

        affiliate.referralCode = newCode;
        await affiliate.save();

        const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        return {
            referralCode: newCode,
            referralLink: `${baseUrl}/ref/${newCode}`,
        };
    }

    /**
     * Track an incoming click on a referral link
     * Public endpoint — no auth required
     * @param {string} code - Referral code
     * @param {string} ip - Visitor IP
     * @param {string} userAgent - Visitor user agent
     * @returns {Object} Click record
     */
    static async trackClick(code, ip, userAgent) {
        const affiliate = await Affiliate.findOne({ referralCode: code });
        if (!affiliate) throw { statusCode: 404, message: 'Invalid referral code' };

        const click = await Click.create({
            affiliateId: affiliate._id,
            referralCode: code,
            ip,
            userAgent: userAgent || '',
            country: 'Unknown', // In production, use IP geolocation
            source: 'direct',
            timestamp: new Date(),
        });

        // Increment affiliate click count
        await Affiliate.findByIdAndUpdate(affiliate._id, {
            $inc: { totalClicks: 1 },
        });

        return click;
    }

    /**
     * Get click tracking history
     * @param {string} userId - Affiliate's user ID
     * @param {Object} query - Pagination params
     * @returns {Object} Click records with pagination
     */
    static async getClicks(userId, { page = 1, limit = 20 }) {
        const affiliate = await Affiliate.findOne({ userId });
        if (!affiliate) throw { statusCode: 404, message: 'Affiliate profile not found' };

        const filter = { affiliateId: affiliate._id };
        const total = await Click.countDocuments(filter);
        const clicks = await Click.find(filter)
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        return {
            clicks,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get funnel statistics (click → register → deposit)
     * @param {string} userId - Affiliate's user ID
     * @returns {Object} Funnel breakdown
     */
    static async getFunnelStats(userId) {
        const affiliate = await Affiliate.findOne({ userId });
        if (!affiliate) throw { statusCode: 404, message: 'Affiliate profile not found' };

        const totalClicks = await Click.countDocuments({ affiliateId: affiliate._id });
        const totalRegistrations = await Referral.countDocuments({ affiliateId: affiliate._id, registered: true });
        const totalDeposits = await Referral.countDocuments({ affiliateId: affiliate._id, firstDeposit: true });

        const clickToRegRate = totalClicks > 0 ? Math.round((totalRegistrations / totalClicks) * 100 * 100) / 100 : 0;
        const regToDepositRate = totalRegistrations > 0 ? Math.round((totalDeposits / totalRegistrations) * 100 * 100) / 100 : 0;
        const overallRate = totalClicks > 0 ? Math.round((totalDeposits / totalClicks) * 100 * 100) / 100 : 0;

        // Get recent referrals
        const recentReferrals = await Referral.find({ affiliateId: affiliate._id })
            .sort({ registeredAt: -1 })
            .limit(10)
            .lean();

        return {
            funnel: {
                clicks: totalClicks,
                registrations: totalRegistrations,
                deposits: totalDeposits,
                clickToRegRate,
                regToDepositRate,
                overallConversionRate: overallRate,
            },
            recentReferrals,
        };
    }

    /**
     * Get earnings breakdown
     * @param {string} userId - Affiliate's user ID
     * @param {Object} query - Pagination params
     * @returns {Object} Earnings data
     */
    static async getEarnings(userId, { page = 1, limit = 20 }) {
        const affiliate = await Affiliate.findOne({ userId });
        if (!affiliate) throw { statusCode: 404, message: 'Affiliate profile not found' };

        // Get referrals with revenue
        const filter = { affiliateId: affiliate._id, revenueGenerated: { $gt: 0 } };
        const total = await Referral.countDocuments(filter);
        const earnings = await Referral.find(filter)
            .sort({ depositAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const totalRevenue = await Referral.aggregate([
            { $match: { affiliateId: affiliate._id } },
            { $group: { _id: null, total: { $sum: '$revenueGenerated' } } },
        ]);

        return {
            earnings,
            totalRevenue: totalRevenue[0]?.total || 0,
            revenueSharePercent: affiliate.revenueSharePercent,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get payout/withdrawal history
     * @param {string} userId - Affiliate's user ID
     * @param {Object} query - Pagination and status filter
     * @returns {Object} Payout records
     */
    static async getPayouts(userId, { page = 1, limit = 10, status = '' }) {
        const filter = { userId, userRole: 'affiliate' };
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            filter.status = status;
        }

        const total = await Withdrawal.countDocuments(filter);
        const payouts = await Withdrawal.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        return {
            payouts,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Request a payout
     * @param {string} userId - Affiliate's user ID
     * @param {Object} data - Payout details
     * @returns {Object} Created payout record
     */
    static async requestPayout(userId, { amount, paymentMethod, paymentDetails }) {
        const affiliate = await Affiliate.findOne({ userId });
        if (!affiliate) throw { statusCode: 404, message: 'Affiliate profile not found' };

        if (amount > affiliate.withdrawableBalance) {
            throw { statusCode: 400, message: `Insufficient balance. Available: $${affiliate.withdrawableBalance}` };
        }

        if (amount < 10) {
            throw { statusCode: 400, message: 'Minimum payout amount is $10' };
        }

        const payout = await Withdrawal.create({
            userId,
            userRole: 'affiliate',
            amount,
            paymentMethod: paymentMethod || 'bank_transfer',
            paymentDetails: paymentDetails || '',
            status: 'pending',
        });

        // Deduct from withdrawable balance
        await Affiliate.findByIdAndUpdate(affiliate._id, {
            $inc: { withdrawableBalance: -amount },
        });

        return payout;
    }

    /**
     * Get marketing assets list
     * Returns static list of downloadable banner assets
     * @returns {Array} Marketing assets
     */
    static async getMarketingAssets() {
        // Static marketing assets (in production, these would be stored in S3/CDN)
        return [
            {
                id: 1,
                name: 'Welcome Bonus Banner',
                type: 'banner',
                dimensions: '728x90',
                format: 'PNG',
                url: '/assets/banners/welcome-bonus-728x90.png',
                thumbnail: '/assets/banners/welcome-bonus-thumb.png',
            },
            {
                id: 2,
                name: 'Sign Up CTA Banner',
                type: 'banner',
                dimensions: '300x250',
                format: 'PNG',
                url: '/assets/banners/signup-cta-300x250.png',
                thumbnail: '/assets/banners/signup-cta-thumb.png',
            },
            {
                id: 3,
                name: 'Casino Promo Wide',
                type: 'banner',
                dimensions: '970x250',
                format: 'PNG',
                url: '/assets/banners/casino-promo-970x250.png',
                thumbnail: '/assets/banners/casino-promo-thumb.png',
            },
            {
                id: 4,
                name: 'Mobile Game Banner',
                type: 'banner',
                dimensions: '320x50',
                format: 'PNG',
                url: '/assets/banners/mobile-game-320x50.png',
                thumbnail: '/assets/banners/mobile-game-thumb.png',
            },
            {
                id: 5,
                name: 'Social Media Post',
                type: 'social',
                dimensions: '1080x1080',
                format: 'PNG',
                url: '/assets/banners/social-post-1080x1080.png',
                thumbnail: '/assets/banners/social-post-thumb.png',
            },
            {
                id: 6,
                name: 'Email Header',
                type: 'email',
                dimensions: '600x200',
                format: 'PNG',
                url: '/assets/banners/email-header-600x200.png',
                thumbnail: '/assets/banners/email-header-thumb.png',
            },
        ];
    }

    /**
     * Update affiliate profile
     * @param {string} userId - Affiliate's user ID
     * @param {Object} data - Profile fields to update
     * @returns {Object} Updated user and affiliate profile
     */
    static async updateProfile(userId, { name, phone, bio, website }) {
        const updates = {};
        if (name) updates.name = name;
        if (phone !== undefined) updates.phone = phone;

        const user = await User.findByIdAndUpdate(userId, updates, { new: true });
        if (!user) throw { statusCode: 404, message: 'User not found' };

        const affiliateUpdates = {};
        if (bio !== undefined) affiliateUpdates.bio = bio;
        if (website !== undefined) affiliateUpdates.website = website;

        let affiliate;
        if (Object.keys(affiliateUpdates).length > 0) {
            affiliate = await Affiliate.findOneAndUpdate({ userId }, affiliateUpdates, { new: true });
        } else {
            affiliate = await Affiliate.findOne({ userId });
        }

        return { user, affiliate };
    }

    /**
     * Change affiliate password
     * @param {string} userId - Affiliate's user ID
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     */
    static async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findById(userId).select('+password');
        if (!user) throw { statusCode: 404, message: 'User not found' };

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) throw { statusCode: 400, message: 'Current password is incorrect' };

        user.password = newPassword;
        await user.save();

        return { message: 'Password changed successfully' };
    }
}

module.exports = AffiliateService;
