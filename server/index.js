// Main server file for Harmony Music Platform
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const { csrfSync } = require('csrf-sync');
const config = require('./config');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');
const { clerkAuthMiddleware, optionalClerkAuth } = require('./middleware/clerkAuth');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const artistRoutes = require('./routes/artists');
const aiRoutes = require('./routes/ai');
const musicRoutes = require('./routes/music');
const socialRoutes = require('./routes/social');
const subscriptionRoutes = require('./routes/subscriptions');
const fanSubscriptionRoutes = require('./routes/fan-subscriptions');
const uploadRoutes = require('./routes/uploads');
const premiumFeaturesRoutes = require('./routes/premium-features');

// Import database connections
const { pool: postgresPool } = require('./config/postgres');
const { getDb: getMongoDb } = require('./config/mongodb');
const { initializeCacheClient, initializeSessionClient } = require('../redis/config');

// Import socket handlers
const { setupSocketHandlers } = require('./socket/socketHandlers');
const RealtimeService = require('./services/realtime-service');

const {
    generateToken,
    csrfSynchronisedProtection
} = csrfSync({
    getTokenFromRequest: (req) => req.headers['x-csrf-token'],
});


const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: config.FRONTEND_URL,
        methods: ["GET", "POST"]
    }
});

// Security middleware
app.use(helmet());
app.use(cors({
    origin: config.FRONTEND_URL,
    credentials: true
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(csrfSynchronisedProtection);
app.use(requestLogger);


// Health check endpoint
app.get('/health', async (req, res) => {
    const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        postgres: false,
        mongo: false,
        redis: false,
    };

    try {
        // Check PostgreSQL
        const postgresResult = await postgresPool.query('SELECT 1');
        health.postgres = postgresResult.rowCount === 1;
    } catch (error) {
        health.postgres = false;
        console.error('PostgreSQL health check failed:', error);
    }

    try {
        // Check MongoDB
        const mongoDb = getMongoDb();
        await mongoDb.command({ ping: 1 });
        health.mongo = true;
    } catch (error) {
        health.mongo = false;
        console.error('MongoDB health check failed:', error);
    }

    try {
        // Check Redis
        const redisClient = require('../redis/config').getCacheClient();
        await redisClient.ping();
        health.redis = true;
    } catch (error) {
        health.redis = false;
        console.error('Redis health check failed:', error);
    }

    if (!health.postgres || !health.mongo || !health.redis) {
        health.status = 'ERROR';
        res.status(503).json(health);
        return;
    }

    res.status(200).json(health);
});

app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: generateToken(req) });
});


// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/fan-subscriptions', fanSubscriptionRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/premium-features', premiumFeaturesRoutes);

// Protected routes (require authentication)
app.use('/api/users', clerkAuthMiddleware);
app.use('/api/artists', clerkAuthMiddleware);
app.use('/api/tracks', clerkAuthMiddleware);
app.use('/api/playlists', clerkAuthMiddleware);
app.use('/api/ai', clerkAuthMiddleware);
app.use('/api/search', clerkAuthMiddleware);
app.use('/api/music', clerkAuthMiddleware);
app.use('/api/subscriptions', clerkAuthMiddleware);
app.use('/api/fan-subscriptions', clerkAuthMiddleware);
app.use('/api/uploads', clerkAuthMiddleware);
app.use('/api/premium-features', clerkAuthMiddleware);

// 404 Not Found handler
app.use(notFound);

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
        const db = {
            postgres: postgresPool,
            mongo: getMongoDb()
        };

        app.use('/api/ai', aiRoutes(db));
        app.use('/api/artists', artistRoutes(db));
        app.use('/api/music', musicRoutes(db));
        app.use('/api/social', socialRoutes(db));
        
        // Initialize Redis clients
        await initializeCacheClient();
        await initializeSessionClient();
        
        // Start the server
        server.listen(config.PORT, () => {
            console.log(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
            console.log(`Health check available at: http://localhost:${config.PORT}/health`);
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