const { errorResponse } = require('../utils/response');

/**
 * Global error handling middleware
 * Catches unhandled errors and returns standardized error response
 */
const errorHandler = (err, req, res, next) => {
    console.error(`❌ Error: ${err.message}`);
    console.error(err.stack);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return errorResponse(res, 400, 'Validation Error', messages);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return errorResponse(res, 400, `Duplicate value for field: ${field}`);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        return errorResponse(res, 400, `Invalid ${err.path}: ${err.value}`);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 401, 'Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Token expired');
    }

    // Default server error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    return errorResponse(res, statusCode, message);
};

module.exports = errorHandler;
