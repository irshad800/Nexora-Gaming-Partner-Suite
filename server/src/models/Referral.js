const mongoose = require('mongoose');

/**
 * Referral Schema
 * Tracks users referred by affiliates through the funnel:
 * click → registration → first deposit
 */
const referralSchema = new mongoose.Schema(
    {
        affiliateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Affiliate',
            required: true,
        },
        clickId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Click',
            default: null,
        },
        referralCode: {
            type: String,
            required: true,
        },
        playerName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
        },
        registered: {
            type: Boolean,
            default: true,
        },
        registeredAt: {
            type: Date,
            default: Date.now,
        },
        firstDeposit: {
            type: Boolean,
            default: false,
        },
        depositAmount: {
            type: Number,
            default: 0,
        },
        depositAt: {
            type: Date,
            default: null,
        },
        revenueGenerated: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['registered', 'deposited', 'active', 'churned'],
            default: 'registered',
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient affiliate queries
referralSchema.index({ affiliateId: 1, createdAt: -1 });

module.exports = mongoose.model('Referral', referralSchema);
