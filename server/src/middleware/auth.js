const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

/**
 * Verify JWT token from Authorization header
 * Attaches decoded user data to req.user
 */
const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return errorResponse(res, 401, 'Not authorized, no token provided');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return errorResponse(res, 401, 'Not authorized, token invalid or expired');
    }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles - Allowed roles (e.g., 'agent', 'affiliate', 'admin')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return errorResponse(res, 403, `Access denied. Required role: ${roles.join(' or ')}`);
        }
        next();
    };
};

module.exports = { protect, authorize };
