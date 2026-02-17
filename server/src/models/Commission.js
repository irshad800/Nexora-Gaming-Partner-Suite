const mongoose = require('mongoose');

/**
 * Commission Schema
 * Tracks agent commission earnings per player activity
 */
const commissionSchema = new mongoose.Schema(
    {
        agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agent',
            required: true,
        },
        playerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player',
            required: true,
        },
        amount: {
            type: Number,
            required: [true, 'Commission amount is required'],
            min: 0,
        },
        playerLoss: {
            type: Number,
            required: true,
            min: 0,
        },
        commissionRate: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ['loss_commission', 'wager_commission', 'bonus'],
            default: 'loss_commission',
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['pending', 'credited', 'cancelled'],
            default: 'credited',
        },
        description: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient date-range queries
commissionSchema.index({ agentId: 1, date: -1 });

module.exports = mongoose.model('Commission', commissionSchema);
