const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Swagger API Documentation Configuration
 * Generates OpenAPI 3.0 specification from JSDoc comments
 */
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Nexora Gaming Partner Suite API',
            version: '1.0.0',
            description:
                'RESTful API for the Nexora Gaming Partner Suite — managing Agent and Affiliate panels for an online gaming platform.',
            contact: {
                name: 'Nexora Gaming',
                email: 'dev@nexora.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token obtained from /api/auth/login',
                },
            },
            schemas: {
                // ==================== Auth Schemas ====================
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'agent@nexora.com' },
                        password: { type: 'string', example: 'agent123' },
                    },
                },
                ForgotPasswordRequest: {
                    type: 'object',
                    required: ['email'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'agent@nexora.com' },
                    },
                },
                ResetPasswordRequest: {
                    type: 'object',
                    required: ['token', 'newPassword'],
                    properties: {
                        token: { type: 'string' },
                        newPassword: { type: 'string', minLength: 6 },
                    },
                },

                // ==================== User/Player Schemas ====================
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string', enum: ['agent', 'affiliate', 'admin'] },
                        phone: { type: 'string' },
                        status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                AddPlayerRequest: {
                    type: 'object',
                    required: ['name', 'email'],
                    properties: {
                        name: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', format: 'email', example: 'john@email.com' },
                        phone: { type: 'string', example: '+971501234567' },
                        country: { type: 'string', example: 'AE' },
                    },
                },

                // ==================== Withdrawal Schema ====================
                WithdrawalRequest: {
                    type: 'object',
                    required: ['amount'],
                    properties: {
                        amount: { type: 'number', minimum: 10, example: 100 },
                        paymentMethod: {
                            type: 'string',
                            enum: ['bank_transfer', 'crypto', 'e_wallet'],
                            example: 'bank_transfer',
                        },
                        paymentDetails: { type: 'string', example: 'Bank: ENBD - ****4521' },
                    },
                },
                ProcessWithdrawalRequest: {
                    type: 'object',
                    required: ['action'],
                    properties: {
                        action: { type: 'string', enum: ['approve', 'reject'] },
                        reason: { type: 'string' },
                    },
                },

                // ==================== Profile Schemas ====================
                UpdateProfileRequest: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        phone: { type: 'string' },
                        bio: { type: 'string' },
                        website: { type: 'string' },
                    },
                },
                ChangePasswordRequest: {
                    type: 'object',
                    required: ['currentPassword', 'newPassword'],
                    properties: {
                        currentPassword: { type: 'string' },
                        newPassword: { type: 'string', minLength: 6 },
                    },
                },

                // ==================== Affiliate Schemas ====================
                GenerateReferralRequest: {
                    type: 'object',
                    properties: {
                        slug: { type: 'string', minLength: 3, example: 'MYCODE2024' },
                    },
                },

                // ==================== Response Schema ====================
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string' },
                        data: { type: 'object' },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        errors: { type: 'array', items: { type: 'object' } },
                    },
                },
            },
        },
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Agent - Dashboard', description: 'Agent dashboard statistics' },
            { name: 'Agent - Users', description: 'Player management' },
            { name: 'Agent - Commissions', description: 'Commission & earnings' },
            { name: 'Agent - Withdrawals', description: 'Withdrawal management' },
            { name: 'Agent - Settings', description: 'Agent profile & password' },
            { name: 'Affiliate - Dashboard', description: 'Affiliate dashboard statistics' },
            { name: 'Affiliate - Referrals', description: 'Referral link management' },
            { name: 'Affiliate - Tracking', description: 'Click tracking & funnel' },
            { name: 'Affiliate - Earnings', description: 'Earnings & payouts' },
            { name: 'Affiliate - Assets', description: 'Marketing assets' },
            { name: 'Affiliate - Settings', description: 'Affiliate profile & password' },
        ],

        // ==================== Path Definitions ====================
        paths: {
            // ===== AUTH =====
            '/api/auth/login': {
                post: {
                    tags: ['Auth'],
                    summary: 'Login user',
                    description: 'Authenticate with email/password and receive JWT token',
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
                    },
                    responses: {
                        200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
                        401: { description: 'Invalid credentials' },
                    },
                },
            },
            '/api/auth/me': {
                get: {
                    tags: ['Auth'],
                    summary: 'Get current user profile',
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: 'Profile retrieved' }, 401: { description: 'Unauthorized' } },
                },
            },
            '/api/auth/forgot-password': {
                post: {
                    tags: ['Auth'],
                    summary: 'Request password reset (dummy)',
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordRequest' } } } },
                    responses: { 200: { description: 'Reset token generated' }, 404: { description: 'Email not found' } },
                },
            },
            '/api/auth/reset-password': {
                post: {
                    tags: ['Auth'],
                    summary: 'Reset password with token',
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } } } },
                    responses: { 200: { description: 'Password reset successful' }, 400: { description: 'Invalid token' } },
                },
            },

            // ===== AGENT DASHBOARD =====
            '/api/agent/dashboard': {
                get: {
                    tags: ['Agent - Dashboard'],
                    summary: 'Get agent dashboard statistics',
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: 'Dashboard data with 7-day earnings graph' } },
                },
            },

            // ===== AGENT USERS =====
            '/api/agent/users': {
                get: {
                    tags: ['Agent - Users'],
                    summary: 'List players under agent',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                        { name: 'search', in: 'query', schema: { type: 'string' } },
                        { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'blocked', 'inactive'] } },
                    ],
                    responses: { 200: { description: 'Paginated player list' } },
                },
                post: {
                    tags: ['Agent - Users'],
                    summary: 'Add new player',
                    security: [{ bearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AddPlayerRequest' } } } },
                    responses: { 201: { description: 'Player created' }, 400: { description: 'Validation error' } },
                },
            },
            '/api/agent/users/{id}': {
                get: {
                    tags: ['Agent - Users'],
                    summary: 'Get player details',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Player details with recent commissions' } },
                },
            },
            '/api/agent/users/{id}/status': {
                patch: {
                    tags: ['Agent - Users'],
                    summary: 'Block/unblock player',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Player status toggled' } },
                },
            },

            // ===== AGENT COMMISSIONS =====
            '/api/agent/commissions': {
                get: {
                    tags: ['Agent - Commissions'],
                    summary: 'Get commission earnings',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer' } },
                        { name: 'limit', in: 'query', schema: { type: 'integer' } },
                        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
                        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
                    ],
                    responses: { 200: { description: 'Commission records with pagination' } },
                },
            },
            '/api/agent/commissions/export': {
                get: {
                    tags: ['Agent - Commissions'],
                    summary: 'Export commissions as CSV',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
                        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
                    ],
                    responses: {
                        200: { description: 'CSV file download', content: { 'text/csv': {} } },
                    },
                },
            },

            // ===== AGENT WITHDRAWALS =====
            '/api/agent/withdrawals': {
                get: {
                    tags: ['Agent - Withdrawals'],
                    summary: 'Get withdrawal history',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer' } },
                        { name: 'limit', in: 'query', schema: { type: 'integer' } },
                        { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'approved', 'rejected'] } },
                    ],
                    responses: { 200: { description: 'Withdrawal records' } },
                },
                post: {
                    tags: ['Agent - Withdrawals'],
                    summary: 'Request withdrawal',
                    security: [{ bearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/WithdrawalRequest' } } } },
                    responses: { 201: { description: 'Withdrawal request created' }, 400: { description: 'Insufficient balance' } },
                },
            },
            '/api/agent/withdrawals/{id}/process': {
                patch: {
                    tags: ['Agent - Withdrawals'],
                    summary: 'Admin: Approve/reject withdrawal',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProcessWithdrawalRequest' } } } },
                    responses: { 200: { description: 'Withdrawal processed' } },
                },
            },

            // ===== AGENT SETTINGS =====
            '/api/agent/settings/profile': {
                put: {
                    tags: ['Agent - Settings'],
                    summary: 'Update agent profile',
                    security: [{ bearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileRequest' } } } },
                    responses: { 200: { description: 'Profile updated' } },
                },
            },
            '/api/agent/settings/password': {
                put: {
                    tags: ['Agent - Settings'],
                    summary: 'Change password',
                    security: [{ bearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } } },
                    responses: { 200: { description: 'Password changed' }, 400: { description: 'Wrong current password' } },
                },
            },

            // ===== AFFILIATE DASHBOARD =====
            '/api/affiliate/dashboard': {
                get: {
                    tags: ['Affiliate - Dashboard'],
                    summary: 'Get affiliate dashboard statistics',
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: 'Dashboard data with conversion chart' } },
                },
            },

            // ===== AFFILIATE REFERRALS =====
            '/api/affiliate/referral-links': {
                get: {
                    tags: ['Affiliate - Referrals'],
                    summary: 'Get referral link info',
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: 'Referral link with stats' } },
                },
                post: {
                    tags: ['Affiliate - Referrals'],
                    summary: 'Generate new referral code',
                    security: [{ bearerAuth: [] }],
                    requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/GenerateReferralRequest' } } } },
                    responses: { 201: { description: 'New referral link generated' } },
                },
            },

            // ===== AFFILIATE TRACKING =====
            '/api/affiliate/track/{code}': {
                post: {
                    tags: ['Affiliate - Tracking'],
                    summary: 'Track referral click (public)',
                    parameters: [{ name: 'code', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 201: { description: 'Click tracked' }, 404: { description: 'Invalid referral code' } },
                },
            },
            '/api/affiliate/clicks': {
                get: {
                    tags: ['Affiliate - Tracking'],
                    summary: 'Get click tracking history',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer' } },
                        { name: 'limit', in: 'query', schema: { type: 'integer' } },
                    ],
                    responses: { 200: { description: 'Click records with pagination' } },
                },
            },
            '/api/affiliate/funnel': {
                get: {
                    tags: ['Affiliate - Tracking'],
                    summary: 'Get conversion funnel stats',
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: 'Funnel: clicks → registrations → deposits' } },
                },
            },

            // ===== AFFILIATE EARNINGS =====
            '/api/affiliate/earnings': {
                get: {
                    tags: ['Affiliate - Earnings'],
                    summary: 'Get earnings breakdown',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer' } },
                        { name: 'limit', in: 'query', schema: { type: 'integer' } },
                    ],
                    responses: { 200: { description: 'Earnings with revenue share details' } },
                },
            },
            '/api/affiliate/payouts': {
                get: {
                    tags: ['Affiliate - Earnings'],
                    summary: 'Get payout history',
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: 'Payout records' } },
                },
                post: {
                    tags: ['Affiliate - Earnings'],
                    summary: 'Request payout',
                    security: [{ bearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/WithdrawalRequest' } } } },
                    responses: { 201: { description: 'Payout request created' }, 400: { description: 'Insufficient balance' } },
                },
            },

            // ===== AFFILIATE ASSETS =====
            '/api/affiliate/assets': {
                get: {
                    tags: ['Affiliate - Assets'],
                    summary: 'Get marketing assets',
                    security: [{ bearerAuth: [] }],
                    responses: { 200: { description: 'List of downloadable banners and assets' } },
                },
            },

            // ===== AFFILIATE SETTINGS =====
            '/api/affiliate/settings/profile': {
                put: {
                    tags: ['Affiliate - Settings'],
                    summary: 'Update affiliate profile',
                    security: [{ bearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileRequest' } } } },
                    responses: { 200: { description: 'Profile updated' } },
                },
            },
            '/api/affiliate/settings/password': {
                put: {
                    tags: ['Affiliate - Settings'],
                    summary: 'Change password',
                    security: [{ bearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } } },
                    responses: { 200: { description: 'Password changed' } },
                },
            },
        },
    },
    apis: [], // We're defining paths inline above
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
