require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

/**
 * Start the Express server
 * Connects to MongoDB first, then starts listening
 */
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
            console.log(`📄 API Docs: http://localhost:${PORT}/api/docs`);
            console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
