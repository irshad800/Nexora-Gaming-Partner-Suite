const mongoose = require('mongoose');

/**
 * Player Schema
 * Represents users/players managed by agents
 * Tracks wagering activity and status
 */
const playerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Player name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Player email is required'],
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
            default: '',
        },
        agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agent',
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'blocked', 'inactive'],
            default: 'active',
        },
        totalWagered: {
            type: Number,
            default: 0,
        },
        totalLost: {
            type: Number,
            default: 0,
        },
        totalWon: {
            type: Number,
            default: 0,
        },
        lastActive: {
            type: Date,
            default: Date.now,
        },
        country: {
            type: String,
            default: 'AE',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Player', playerSchema);
