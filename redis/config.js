const { createClient } = require('redis');
const config = require('../server/config');
const logger = require('../server/utils/logger');

const redisClient = createClient({
    url: config.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
    }
});

redisClient.on('connect', () => {
    logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
    logger.error('Redis client error:', err);
});

async function connectRedis() {
    try {
        await redisClient.connect();
    } catch (error) {
        logger.error('Failed to connect to Redis:', error);
        throw error;
    }
}

async function disconnectRedis() {
    try {
        await redisClient.quit();
    } catch (error) {
        logger.error('Error disconnecting from Redis:', error);
    }
}

async function checkRedisHealth() {
    try {
        await redisClient.ping();
        return true;
    } catch (error) {
        logger.error('Redis health check failed:', error);
        return false;
    }
}

module.exports = {
    redisClient,
    connectRedis,
    disconnectRedis,
    checkRedisHealth,
};