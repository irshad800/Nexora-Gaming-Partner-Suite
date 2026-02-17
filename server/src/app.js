const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --------------- Security Middleware ---------------
app.use(helmet());

// --------------- CORS Configuration ---------------
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    })
);

// --------------- Body Parsing ---------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// --------------- API Routes ---------------
const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);
// Agent and Affiliate routes will be mounted in subsequent phases

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
