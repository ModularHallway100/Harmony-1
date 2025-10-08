// Logging Middleware for Harmony Music Platform
const pino = require('pino');
const { createWriteStream } = require('fs');
const { join } = require('path');
const { mkdir } = require('fs').promises;

// Create logs directory if it doesn't exist
const logsDir = join(__dirname, '../../logs');
mkdir(logsDir, { recursive: true }).catch(() => {});

// Create logger with transport for file output
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
        level: label => {
            return { level: label };
        }
    }
}, pino.multistream([
    { stream: process.stdout }, // Log to console
    { 
        stream: createWriteStream(join(logsDir, 'combined.log'), { flags: 'a' }) 
    }, // Log to combined file
    { 
        stream: createWriteStream(join(logsDir, 'error.log'), { flags: 'a' }),
        level: 'error' // Only errors to error log
    }
]));

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log incoming request
    logger.info('Incoming request', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.id || generateRequestId()
    });

    // Override end method to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const duration = Date.now() - start;
        
        // Log outgoing response
        logger.info('Outgoing response', {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            contentLength: res.get('Content-Length'),
            requestId: req.id || generateRequestId()
        });

        // Call original end method
        originalEnd.call(this, chunk, encoding);
    };

    next();
};

/**
 * Generate unique request ID
 */
const generateRequestId = () => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Log database queries
 */
const logDatabaseQuery = (query, params, duration) => {
    logger.debug('Database query', {
        query,
        params,
        duration: `${duration}ms`,
        slowQuery: duration > 1000 ? true : false
    });
};

/**
 * Log API errors
 */
const logApiError = (error, req, res) => {
    logger.error('API Error', {
        error: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        statusCode: res.statusCode,
        requestId: req.id || generateRequestId()
    });
};

/**
 * Log user actions
 */
const logUserAction = (userId, action, details = {}) => {
    logger.info('User action', {
        userId,
        action,
        details,
        timestamp: new Date().toISOString()
    });
};

/**
 * Log security events
 */
const logSecurityEvent = (event, details = {}) => {
    logger.warn('Security event', {
        event,
        details,
        timestamp: new Date().toISOString()
    });
};

/**
 * Log performance metrics
 */
const logPerformance = (metric, value, unit = 'ms') => {
    logger.info('Performance metric', {
        metric,
        value,
        unit,
        timestamp: new Date().toISOString()
    });
};

/**
 * Log system health
 */
const logSystemHealth = (status, details = {}) => {
    logger.info('System health', {
        status,
        details,
        timestamp: new Date().toISOString()
    });
};

/**
 * Log database connection status
 */
const logDatabaseConnection = (status, details = {}) => {
    logger.info('Database connection', {
        status,
        details,
        timestamp: new Date().toISOString()
    });
};

/**
 * Log Redis connection status
 */
const logRedisConnection = (status, details = {}) => {
    logger.info('Redis connection', {
        status,
        details,
        timestamp: new Date().toISOString()
    });
};

/**
 * Log authentication events
 */
const logAuthenticationEvent = (event, userId, details = {}) => {
    logger.info('Authentication event', {
        event,
        userId,
        details,
        timestamp: new Date().toISOString()
    });
};

/**
 * Log AI generation events
 */
const logAIGeneration = (userId, generationType, prompt, status, details = {}) => {
    logger.info('AI generation', {
        userId,
        generationType,
        prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
        status,
        details,
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    logger,
    requestLogger,
    logDatabaseQuery,
    logApiError,
    logUserAction,
    logSecurityEvent,
    logPerformance,
    logSystemHealth,
    logDatabaseConnection,
    logRedisConnection,
    logAuthenticationEvent,
    logAIGeneration
};