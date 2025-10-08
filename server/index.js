// Main server file for Harmony Music Platform
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');
const { clerkAuthMiddleware, optionalClerkAuth } = require('./middleware/clerkAuth');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const artistRoutes = require('./routes/artists');
const trackRoutes = require('./routes/tracks');
const playlistRoutes = require('./routes/playlists');
const aiRoutes = require('./routes/ai');
const searchRoutes = require('./routes/search');
const musicRoutes = require('./routes/music');
const recommendationService = require('./services/recommendation-service');

// Import database connections
const { connectPostgreSQL } = require('./config/postgres');
const { connectMongoDB } = require('./config/mongodb');
const { initializeCacheClient, initializeSessionClient } = require('../redis/config');

// Import socket handlers
const { setupSocketHandlers } = require('./socket/socketHandlers');
const RealtimeService = require('./services/realtime-service');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Environment variables
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));

// Compression middleware
app.use(compression());

// Rate limiting
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        uptime: process.uptime()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);

// Protected routes (require authentication)
app.use('/api/users', clerkAuthMiddleware);
app.use('/api/artists', clerkAuthMiddleware);
app.use('/api/tracks', clerkAuthMiddleware);
app.use('/api/playlists', clerkAuthMiddleware);
app.use('/api/ai', clerkAuthMiddleware);
app.use('/api/search', clerkAuthMiddleware);
app.use('/api/music', clerkAuthMiddleware);

// Error handling middleware
app.use(errorHandler);

// Socket.IO setup
setupSocketHandlers(io);

// Initialize real-time service
const realtimeService = new RealtimeService(io);
realtimeService.init();

// Start server function
const startServer = async () => {
    try {
        // Connect to databases
        await connectPostgreSQL();
        await connectMongoDB();
        
        // Initialize Redis clients
        await initializeCacheClient();
        await initializeSessionClient();
        
        // Start the server
        server.listen(PORT, () => {
            console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
            console.log(`Health check available at: http://localhost:${PORT}/health`);
        });
        
        // Graceful shutdown
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown function
const gracefulShutdown = async () => {
    console.log('Received shutdown signal, gracefully shutting down...');
    
    // Close HTTP server
    server.close(() => {
        console.log('HTTP server closed');
    });
    
    // Disconnect from Redis
    const { disconnect } = require('../redis/config');
    await disconnect();
    
    // Exit process
    process.exit(0);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Perform any cleanup here
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Perform any cleanup here
    process.exit(1);
});

// Start the server
startServer();