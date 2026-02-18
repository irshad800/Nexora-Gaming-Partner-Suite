const { validationResult } = require('express-validator');
const AgentService = require('../services/agentService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Agent Controller
 * Handles all Agent Panel HTTP requests
 */
class AgentController {
    /**
     * GET /api/agent/dashboard
     * Get agent dashboard statistics
     */
    static async getDashboard(req, res, next) {
        try {
            const stats = await AgentService.getDashboardStats(req.user.id);
            return successResponse(res, 200, 'Dashboard data retrieved', stats);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * GET /api/agent/users
     * Get paginated list of players
     */
    static async getUsers(req, res, next) {
        try {
            const result = await AgentService.getUsers(req.user.id, req.query);
            return successResponse(res, 200, 'Users retrieved', result);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * GET /api/agent/users/export
     * Export players as CSV
     */
    static async exportUsers(req, res, next) {
        try {
            const data = await AgentService.exportUsers(req.user.id, req.query);

            if (data.length === 0) {
                return errorResponse(res, 404, 'No player data to export');
            }

            // Generate CSV manually
            const headers = Object.keys(data[0]);
            const csvRows = [
                headers.join(','),
                ...data.map((row) =>
                    headers.map((h) => `"${row[h]}"`).join(',')
                ),
            ];

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=players.csv');
            return res.send(csvRows.join('\n'));
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * POST /api/agent/users
     * Add a new player
     */
    static async addUser(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation failed', errors.array());
            }

            const player = await AgentService.addUser(req.user.id, req.body);
            return successResponse(res, 201, 'Player added successfully', player);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * GET /api/agent/users/:id
     * Get player details
     */
    static async getUserById(req, res, next) {
        try {
            const result = await AgentService.getUserById(req.user.id, req.params.id);
            return successResponse(res, 200, 'Player details retrieved', result);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * PATCH /api/agent/users/:id/status
     * Block/unblock a player
     */
    static async toggleUserStatus(req, res, next) {
        try {
            const player = await AgentService.toggleUserStatus(req.user.id, req.params.id);
            return successResponse(res, 200, `Player ${player.status === 'active' ? 'unblocked' : 'blocked'} successfully`, player);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * GET /api/agent/commissions
     * Get commission earnings
     */
    static async getCommissions(req, res, next) {
        try {
            const result = await AgentService.getCommissions(req.user.id, req.query);
            return successResponse(res, 200, 'Commissions retrieved', result);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * GET /api/agent/commissions/export
     * Export commissions as CSV
     */
    static async exportCommissions(req, res, next) {
        try {
            const data = await AgentService.exportCommissions(req.user.id, req.query);

            if (data.length === 0) {
                return errorResponse(res, 404, 'No commission data to export');
            }

            // Generate CSV manually
            const headers = Object.keys(data[0]);
            const csvRows = [
                headers.join(','),
                ...data.map((row) =>
                    headers.map((h) => `"${row[h]}"`).join(',')
                ),
            ];

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=commissions.csv');
            return res.send(csvRows.join('\n'));
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * GET /api/agent/withdrawals
     * Get withdrawal history
     */
    static async getWithdrawals(req, res, next) {
        try {
            const result = await AgentService.getWithdrawals(req.user.id, req.query);
            return successResponse(res, 200, 'Withdrawals retrieved', result);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * POST /api/agent/withdrawals
     * Request a withdrawal
     */
    static async requestWithdrawal(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation failed', errors.array());
            }

            const withdrawal = await AgentService.requestWithdrawal(req.user.id, req.body);
            return successResponse(res, 201, 'Withdrawal request submitted', withdrawal);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * PATCH /api/agent/withdrawals/:id/process
     * Admin: Approve or reject withdrawal
     */
    static async processWithdrawal(req, res, next) {
        try {
            const { action, reason } = req.body;
            const withdrawal = await AgentService.processWithdrawal(
                req.params.id,
                action,
                req.user.id,
                reason
            );
            return successResponse(res, 200, `Withdrawal ${action}d successfully`, withdrawal);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * PUT /api/agent/settings/profile
     * Update agent profile
     */
    static async updateProfile(req, res, next) {
        try {
            const result = await AgentService.updateProfile(req.user.id, req.body);
            return successResponse(res, 200, 'Profile updated', result);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }

    /**
     * PUT /api/agent/settings/password
     * Change agent password
     */
    static async changePassword(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation failed', errors.array());
            }

            const { currentPassword, newPassword } = req.body;
            const result = await AgentService.changePassword(req.user.id, currentPassword, newPassword);
            return successResponse(res, 200, result.message);
        } catch (error) {
            if (error.statusCode) return errorResponse(res, error.statusCode, error.message);
            next(error);
        }
    }
}

module.exports = AgentController;
