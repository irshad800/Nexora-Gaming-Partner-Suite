const mongoose = require('mongoose');

/**
 * Affiliate Schema
 * Extended profile for users with role 'affiliate'
 * Tracks referral codes, revenue share, and conversion metrics
 */
const affiliateSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        referralCode: {
            type: String,
            unique: true,
            required: true,
        },
        revenueSharePercent: {
            type: Number,
            default: 25, // 25% revenue share (dummy)
            min: 0,
            max: 100,
        },
        totalClicks: {
            type: Number,
            default: 0,
        },
        totalRegistrations: {
            type: Number,
            default: 0,
        },
        totalDeposits: {
            type: Number,
            default: 0,
        },
        totalEarnings: {
            type: Number,
            default: 0,
        },
        withdrawableBalance: {
            type: Number,
            default: 0,
        },
        totalWithdrawn: {
            type: Number,
            default: 0,
        },
        website: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            default: '',
            maxlength: 500,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Affiliate', affiliateSchema);
