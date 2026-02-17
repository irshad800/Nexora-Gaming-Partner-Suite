const mongoose = require('mongoose');

/**
 * Withdrawal Schema
 * Handles withdrawal requests for both agents and affiliates
 * Includes approval workflow with status tracking
 */
const withdrawalSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userRole: {
            type: String,
            enum: ['agent', 'affiliate'],
            required: true,
        },
        amount: {
            type: Number,
            required: [true, 'Withdrawal amount is required'],
            min: [10, 'Minimum withdrawal amount is $10'],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['bank_transfer', 'crypto', 'e_wallet'],
            default: 'bank_transfer',
        },
        paymentDetails: {
            type: String,
            default: '',
        },
        processedAt: {
            type: Date,
            default: null,
        },
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        rejectionReason: {
            type: String,
            default: '',
        },
        transactionId: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient user-based queries
withdrawalSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
