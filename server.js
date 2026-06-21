const app = require('./app');
const http = require('http');
const connectDB = require('./config/db');
const { initSocket } = require('./src/utils/socket');

const PORT = process.env.PORT || 3000;

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect to Database
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
});

// Graceful Shutdown
const gracefulShutdown = (signal) => {
    
    // Stop accepting new connections
    server.close(async () => {
        console.log('HTTP server closed.');
        try {
            const mongoose = require('mongoose');
            if (mongoose.connection && mongoose.connection.readyState !== 0) {
                await mongoose.connection.close();
                console.log('MongoDB connection closed.');
            }
            console.log('Graceful shutdown completed successfully.');
            process.exit(0);
        } catch (err) {
            console.error('Error during graceful shutdown database close:', err);
            process.exit(1);
        }
    });

    // Force shutdown after timeout (10 seconds)
    setTimeout(() => {
        console.error('Graceful shutdown timeout exceeded. Forcefully shutting down...');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

