// Error Handling Middleware for Harmony Music Platform
const logger = require('../utils/logger');

/**
 * Custom App Error class
 */
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Handle CastError (invalid ObjectId)
 */
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

/**
 * Handle Duplicate Fields Error
 */
const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};

/**
 * Handle Validation Error
 */
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again!', 401);
const handleSyntaxError = () => new AppError('Invalid JSON payload', 400);
const handleCSRFError = () => new AppError('Invalid CSRF token', 403);

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    } 
    // Programming or unknown error: don't leak error details
    else {
        // Log error
        logger.error('ERROR 💥', err);
        
        // Send generic message
        res.status(500).json({
            success: false,
            message: 'Something went wrong!'
        });
    }
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error
    logger.error('Error occurred:', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Differentiate between development and production environments
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;

        // Handle specific errors
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        if (error instanceof SyntaxError && 'body' in error) error = handleSyntaxError();
        if (error.code === 'EBADCSRFTOKEN') error = handleCSRFError();

        sendErrorProd(error, res);
    }
};

/**
 * Async error wrapper for route handlers
 */
const asyncHandler = fn => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
    const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
    next(err);
};

module.exports = {
    AppError,
    errorHandler,
    asyncHandler,
    notFound
};