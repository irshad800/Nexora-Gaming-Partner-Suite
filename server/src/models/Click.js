const mongoose = require('mongoose');

/**
 * Click Schema
 * Tracks incoming clicks on affiliate referral links
 * Stores IP and user agent for analytics
 */
const clickSchema = new mongoose.Schema(
    {
        affiliateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Affiliate',
            required: true,
        },
        referralCode: {
            type: String,
            required: true,
        },
        ip: {
            type: String,
            required: true,
        },
        userAgent: {
            type: String,
            default: '',
        },
        country: {
            type: String,
            default: 'Unknown',
        },
        source: {
            type: String,
            default: 'direct',
        },
        converted: {
            type: Boolean,
            default: false,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient affiliate-based and time-range queries
clickSchema.index({ affiliateId: 1, timestamp: -1 });
clickSchema.index({ referralCode: 1 });

module.exports = mongoose.model('Click', clickSchema);
