const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

async function connectMongoDB() {
    try {
        await mongoose.connect(config.MONGODB_URL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,
            retryWrites: true,
            w: 'majority'
        });
    } catch (error) {
        logger.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}

async function disconnectMongoDB() {
    try {
        await mongoose.connection.close();
    } catch (error) {
        logger.error('Error disconnecting from MongoDB:', error);
        throw error;
    }
}

async function checkMongoHealth() {
    try {
        if (mongoose.connection.readyState !== 1) {
            return false;
        }
        await mongoose.connection.db.admin().ping();
        return true;
    } catch (error) {
        logger.error('MongoDB health check failed:', error);
        return false;
    }
}

function getDb() {
    if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB not connected');
    }
    return mongoose.connection.db;
}

module.exports = {
    connectMongoDB,
    disconnectMongoDB,
    checkMongoHealth,
    getDb,
};