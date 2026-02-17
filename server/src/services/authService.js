const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Agent = require('../models/Agent');
const Affiliate = require('../models/Affiliate');

/**
 * Auth Service
 * Handles authentication business logic
 */
class AuthService {
    /**
     * Generate JWT token for a user
     * @param {string} userId - User's MongoDB ID
     * @param {string} role - User's role (agent/affiliate/admin)
     * @returns {string} JWT token
     */
    static generateToken(userId, role) {
        return jwt.sign(
            { id: userId, role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );
    }

    /**
     * Authenticate user with email and password
     * @param {string} email - User email
     * @param {string} password - Plain text password
     * @returns {Object} - { user, token, profile }
     */
    static async login(email, password) {
        // Find user and explicitly include password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            throw { statusCode: 401, message: 'Invalid email or password' };
        }

        if (user.status !== 'active') {
            throw { statusCode: 403, message: 'Account is suspended or inactive. Contact support.' };
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw { statusCode: 401, message: 'Invalid email or password' };
        }

        // Generate token
        const token = this.generateToken(user._id, user.role);

        // Get role-specific profile
        let profile = null;
        if (user.role === 'agent') {
            profile = await Agent.findOne({ userId: user._id });
        } else if (user.role === 'affiliate') {
            profile = await Affiliate.findOne({ userId: user._id });
        }

        // Remove password from response
        const userObj = user.toObject();
        delete userObj.password;

        return { user: userObj, token, profile };
    }

    /**
     * Get current user profile by ID
     * @param {string} userId - User's MongoDB ID
     * @returns {Object} - { user, profile }
     */
    static async getProfile(userId) {
        const user = await User.findById(userId);

        if (!user) {
            throw { statusCode: 404, message: 'User not found' };
        }

        let profile = null;
        if (user.role === 'agent') {
            profile = await Agent.findOne({ userId: user._id });
        } else if (user.role === 'affiliate') {
            profile = await Affiliate.findOne({ userId: user._id });
        }

        return { user, profile };
    }

    /**
     * Generate dummy password reset token
     * In production this would send an email
     * @param {string} email - User email
     * @returns {Object} - { resetToken, message }
     */
    static async forgotPassword(email) {
        const user = await User.findOne({ email });

        if (!user) {
            throw { statusCode: 404, message: 'No account found with that email' };
        }

        // Generate dummy reset token
        const resetToken = require('crypto').randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
        await user.save();

        return {
            resetToken,
            message: 'Password reset token generated (in production, this would be sent via email)',
        };
    }

    /**
     * Reset password using token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     */
    static async resetPassword(token, newPassword) {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() },
        }).select('+password');

        if (!user) {
            throw { statusCode: 400, message: 'Invalid or expired reset token' };
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        return { message: 'Password reset successful' };
    }
}

module.exports = AuthService;
