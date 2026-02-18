const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --------------- Security Middleware ---------------
app.use(helmet());

// --------------- CORS Configuration ---------------
const allowedOrigins = [
    process.env.CLIENT_URL,
    'https://nexora-gaming-partner-suite.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
].filter(Boolean).map(url => url.replace(/\/$/, '')); // Strip trailing slashes

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    })
);

// --------------- Body Parsing ---------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Debug middleware to inspect request body
app.use((req, res, next) => {
    if (req.method === 'POST') {
        console.log(`📡 Incoming POST to ${req.path}`);
        console.log('📦 Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// --------------- Request Logging ---------------
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// --------------- Health Check ---------------
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Nexora Gaming API is running',
        timestamp: new Date().toISOString(),
    });
});

// --------------- API Documentation ---------------
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Nexora Gaming API Docs',
}));

// --------------- API Routes ---------------
const authRoutes = require('./routes/authRoutes');
const agentRoutes = require('./routes/agentRoutes');
const affiliateRoutes = require('./routes/affiliateRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/affiliate', affiliateRoutes);

// --------------- 404 Handler ---------------
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// --------------- Global Error Handler ---------------
app.use(errorHandler);

module.exports = app;
