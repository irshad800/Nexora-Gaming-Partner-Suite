const { validationResult } = require('express-validator');
const AuthService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Auth Controller
 * Handles authentication HTTP requests
 */
class AuthController {
    /**
     * POST /api/auth/login
     * Authenticate user and return JWT token
     */
    static async login(req, res, next) {
        try {
            // Validate request body
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation failed', errors.array());
            }

            const { email, password } = req.body;
            const result = await AuthService.login(email, password);

            return successResponse(res, 200, 'Login successful', {
                user: result.user,
                profile: result.profile,
                token: result.token,
            });
        } catch (error) {
            if (error.statusCode) {
                return errorResponse(res, error.statusCode, error.message);
            }
            next(error);
        }
    }

    /**
     * GET /api/auth/me
     * Get current authenticated user profile
     */
    static async getMe(req, res, next) {
        try {
            const result = await AuthService.getProfile(req.user.id);

            return successResponse(res, 200, 'Profile retrieved', {
                user: result.user,
                profile: result.profile,
            });
        } catch (error) {
            if (error.statusCode) {
                return errorResponse(res, error.statusCode, error.message);
            }
            next(error);
        }
    }

    /**
     * POST /api/auth/forgot-password
     * Generate password reset token (dummy flow)
     */
    static async forgotPassword(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation failed', errors.array());
            }

            const { email } = req.body;
            const result = await AuthService.forgotPassword(email);

            return successResponse(res, 200, result.message, {
                resetToken: result.resetToken,
            });
        } catch (error) {
            if (error.statusCode) {
                return errorResponse(res, error.statusCode, error.message);
            }
            next(error);
        }
    }

    /**
     * POST /api/auth/reset-password
     * Reset password using token
     */
    static async resetPassword(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return errorResponse(res, 400, 'Validation failed', errors.array());
            }

            const { token, newPassword } = req.body;
            const result = await AuthService.resetPassword(token, newPassword);

            return successResponse(res, 200, result.message);
        } catch (error) {
            if (error.statusCode) {
                return errorResponse(res, error.statusCode, error.message);
            }
            next(error);
        }
    }
}

module.exports = AuthController;
