const Agent = require('../models/Agent');
const Player = require('../models/Player');
const Commission = require('../models/Commission');
const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');

/**
 * Agent Service
 * Business logic for agent panel operations
 */
class AgentService {
    /**
     * Get dashboard statistics for an agent
     * @param {string} userId - Agent's user ID
     * @returns {Object} Dashboard stats + 7-day earnings graph data
     */
    static async getDashboardStats(userId) {
        const agent = await Agent.findOne({ userId });
        if (!agent) throw { statusCode: 404, message: 'Agent profile not found' };

        // Get total active users count
        const totalUsers = await Player.countDocuments({ agentId: agent._id });
        const activeUsers = await Player.countDocuments({ agentId: agent._id, status: 'active' });

        // Get 7-day earnings data for graph
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const dailyEarnings = await Commission.aggregate([
            {
                $match: {
                    agentId: agent._id,
                    date: { $gte: sevenDaysAgo },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Fill in missing days with zero
        const graphData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = dailyEarnings.find((d) => d._id === dateStr);
            graphData.push({
                date: dateStr,
                earnings: dayData ? Math.round(dayData.total * 100) / 100 : 0,
                transactions: dayData ? dayData.count : 0,
            });
        }

        // Pending withdrawals count
        const pendingWithdrawals = await Withdrawal.countDocuments({
            userId,
            status: 'pending',
        });

        return {
            totalUsers,
            activeUsers,
            totalRevenue: Math.round(agent.totalEarnings * 100) / 100,
            pendingCommission: Math.round(agent.pendingCommission * 100) / 100,
            withdrawableBalance: Math.round(agent.withdrawableBalance * 100) / 100,
            totalWithdrawn: Math.round(agent.totalWithdrawn * 100) / 100,
            commissionRate: agent.commissionRate,
            pendingWithdrawals,
            graphData,
        };
    }

    /**
     * Get paginated list of players under an agent
     * @param {string} userId - Agent's user ID
     * @param {Object} query - Pagination and search params
     * @returns {Object} Players list with pagination info
     */
    static async getUsers(userId, { page = 1, limit = 10, search = '', status = '' }) {
        const agent = await Agent.findOne({ userId });
        if (!agent) throw { statusCode: 404, message: 'Agent profile not found' };

        const filter = { agentId: agent._id };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        if (status && ['active', 'blocked', 'inactive'].includes(status)) {
            filter.status = status;
        }

        const total = await Player.countDocuments(filter);
        const players = await Player.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        return {
            players,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Add a new player under an agent
     * @param {string} userId - Agent's user ID
     * @param {Object} playerData - Player details
     * @returns {Object} Created player
     */
    static async addUser(userId, playerData) {
        const agent = await Agent.findOne({ userId });
        if (!agent) throw { statusCode: 404, message: 'Agent profile not found' };

        // Check for duplicate email
        const existing = await Player.findOne({ email: playerData.email });
        if (existing) throw { statusCode: 400, message: 'A player with this email already exists' };

        const player = await Player.create({
            ...playerData,
            agentId: agent._id,
        });

        // Update agent's total users count
        await Agent.findByIdAndUpdate(agent._id, { $inc: { totalUsers: 1 } });

        return player;
    }

    /**
     * Get a specific player's details
     * @param {string} userId - Agent's user ID
     * @param {string} playerId - Player's MongoDB ID
     * @returns {Object} Player details
     */
    static async getUserById(userId, playerId) {
        const agent = await Agent.findOne({ userId });
        if (!agent) throw { statusCode: 404, message: 'Agent profile not found' };

        const player = await Player.findOne({ _id: playerId, agentId: agent._id });
        if (!player) throw { statusCode: 404, message: 'Player not found' };

        // Get player's commission history
        const commissions = await Commission.find({ playerId })
            .sort({ date: -1 })
            .limit(10)
            .lean();

        return { player, recentCommissions: commissions };
    }

    /**
     * Toggle player status (block/unblock)
     * @param {string} userId - Agent's user ID
     * @param {string} playerId - Player's MongoDB ID
     * @returns {Object} Updated player
     */
    static async toggleUserStatus(userId, playerId) {
        const agent = await Agent.findOne({ userId });
        if (!agent) throw { statusCode: 404, message: 'Agent profile not found' };

        const player = await Player.findOne({ _id: playerId, agentId: agent._id });
        if (!player) throw { statusCode: 404, message: 'Player not found' };

        player.status = player.status === 'active' ? 'blocked' : 'active';
        await player.save();

        return player;
    }

    /**
     * Get commission earnings with date filtering
     * @param {string} userId - Agent's user ID
     * @param {Object} query - Date range and pagination
     * @returns {Object} Commission records
     */
    static async getCommissions(userId, { page = 1, limit = 20, startDate, endDate }) {
        const agent = await Agent.findOne({ userId });
        if (!agent) throw { statusCode: 404, message: 'Agent profile not found' };

        const filter = { agentId: agent._id };

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const total = await Commission.countDocuments(filter);
        const commissions = await Commission.find(filter)
            .populate('playerId', 'name email')
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        // Calculate totals for the filtered period
        const totalAmount = await Commission.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        return {
            commissions,
            totalAmount: totalAmount[0]?.total || 0,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Export commissions as CSV data
     * @param {string} userId - Agent's user ID
     * @param {Object} query - Date range filters
     * @returns {Array} Commission records for CSV
     */
    static async exportCommissions(userId, { startDate, endDate }) {
        const agent = await Agent.findOne({ userId });
        if (!agent) throw { statusCode: 404, message: 'Agent profile not found' };

        const filter = { agentId: agent._id };
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const commissions = await Commission.find(filter)
            .populate('playerId', 'name email')
            .sort({ date: -1 })
            .lean();

        return commissions.map((c) => ({
            Date: new Date(c.date).toLocaleDateString(),
            Player: c.playerId?.name || 'N/A',
            'Player Email': c.playerId?.email || 'N/A',
            'Player Loss': c.playerLoss,
            'Commission Rate': `${c.commissionRate}%`,
            Amount: c.amount,
            Status: c.status,
            Type: c.type,
        }));
    }

    /**
     * Get withdrawal history for an agent
     * @param {string} userId - Agent's user ID
     * @param {Object} query - Pagination and status filter
     * @returns {Object} Withdrawal records
     */
    static async getWithdrawals(userId, { page = 1, limit = 10, status = '' }) {
        const filter = { userId, userRole: 'agent' };
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            filter.status = status;
        }

        const total = await Withdrawal.countDocuments(filter);
        const withdrawals = await Withdrawal.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        return {
            withdrawals,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Request a withdrawal
     * Validates balance and creates withdrawal record
     * @param {string} userId - Agent's user ID
     * @param {Object} data - Withdrawal details
     * @returns {Object} Created withdrawal
     */
    static async requestWithdrawal(userId, { amount, paymentMethod, paymentDetails }) {
        const agent = await Agent.findOne({ userId });
        if (!agent) throw { statusCode: 404, message: 'Agent profile not found' };

        if (amount > agent.withdrawableBalance) {
            throw { statusCode: 400, message: `Insufficient balance. Available: $${agent.withdrawableBalance}` };
        }

        if (amount < 10) {
            throw { statusCode: 400, message: 'Minimum withdrawal amount is $10' };
        }

        const withdrawal = await Withdrawal.create({
            userId,
            userRole: 'agent',
            amount,
            paymentMethod: paymentMethod || 'bank_transfer',
            paymentDetails: paymentDetails || '',
            status: 'pending',
        });

        // Deduct from withdrawable balance immediately to prevent double-withdrawal
        await Agent.findByIdAndUpdate(agent._id, {
            $inc: { withdrawableBalance: -amount },
        });

        return withdrawal;
    }

    /**
     * Admin: Approve or reject a withdrawal
     * @param {string} withdrawalId - Withdrawal record ID
     * @param {string} action - 'approve' or 'reject'
     * @param {string} adminId - Admin user ID
     * @param {string} reason - Rejection reason (optional)
     * @returns {Object} Updated withdrawal
     */
    static async processWithdrawal(withdrawalId, action, adminId, reason = '') {
        const withdrawal = await Withdrawal.findById(withdrawalId);
        if (!withdrawal) throw { statusCode: 404, message: 'Withdrawal not found' };
        if (withdrawal.status !== 'pending') {
            throw { statusCode: 400, message: 'This withdrawal has already been processed' };
        }

        if (action === 'approve') {
            withdrawal.status = 'approved';
            withdrawal.processedAt = new Date();
            withdrawal.processedBy = adminId;
            withdrawal.transactionId = `TXN-${Date.now()}`;

            // Update agent's totalWithdrawn
            const agent = await Agent.findOne({ userId: withdrawal.userId });
            if (agent) {
                await Agent.findByIdAndUpdate(agent._id, {
                    $inc: { totalWithdrawn: withdrawal.amount },
                });
            }
        } else if (action === 'reject') {
            withdrawal.status = 'rejected';
            withdrawal.processedAt = new Date();
            withdrawal.processedBy = adminId;
            withdrawal.rejectionReason = reason || 'Request rejected by admin';

            // Refund the balance
            const agent = await Agent.findOne({ userId: withdrawal.userId });
            if (agent) {
                await Agent.findByIdAndUpdate(agent._id, {
                    $inc: { withdrawableBalance: withdrawal.amount },
                });
            }
        } else {
            throw { statusCode: 400, message: 'Invalid action. Use "approve" or "reject"' };
        }

        await withdrawal.save();
        return withdrawal;
    }

    /**
     * Update agent profile
     * @param {string} userId - Agent's user ID
     * @param {Object} data - Profile fields to update
     * @returns {Object} Updated user and agent profile
     */
    static async updateProfile(userId, { name, phone, bio }) {
        const updates = {};
        if (name) updates.name = name;
        if (phone !== undefined) updates.phone = phone;

        const user = await User.findByIdAndUpdate(userId, updates, { new: true });
        if (!user) throw { statusCode: 404, message: 'User not found' };

        let agent = null;
        if (bio !== undefined) {
            agent = await Agent.findOneAndUpdate({ userId }, { bio }, { new: true });
        } else {
            agent = await Agent.findOne({ userId });
        }

        return { user, agent };
    }

    /**
     * Change agent password
     * @param {string} userId - Agent's user ID
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

module.exports = AgentService;
