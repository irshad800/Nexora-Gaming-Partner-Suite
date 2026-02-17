const mongoose = require('mongoose');

/**
 * Agent Schema
 * Extended profile for users with role 'agent'
 * Tracks commission rates, earnings, and withdrawable balance
 */
const agentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        agentCode: {
            type: String,
            unique: true,
            required: true,
        },
        commissionRate: {
            type: Number,
            default: 10, // 10% commission (dummy, hard-coded)
            min: 0,
            max: 100,
        },
        totalEarnings: {
            type: Number,
            default: 0,
        },
        pendingCommission: {
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
        totalUsers: {
            type: Number,
            default: 0,
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

module.exports = mongoose.model('Agent', agentSchema);
