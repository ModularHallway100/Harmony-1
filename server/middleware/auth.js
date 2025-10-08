// JWT Authentication Middleware for Harmony Music Platform
const jwt = require('jsonwebtoken');
const { postgresConnection } = require('../config/postgres');
const { getCachedUserProfile } = require('../../redis/config');
const logger = require('../utils/logger');

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

/**
 * Verify JWT token and extract user information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access token required. Please provide a valid Bearer token.'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Check if user exists in database
        const userQuery = await postgresConnection.query(
            'SELECT id, email, username, full_name, avatar_url, bio, user_type, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );
        
        if (userQuery.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Please sign in again.'
            });
        }
        
        const user = userQuery.rows[0];
        
        // Check if user is active
        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }
        
        // Add user information to request object
        req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.full_name,
            avatarUrl: user.avatar_url,
            bio: user.bio,
            userType: user.user_type
        };
        
        // Add token information to request object
        req.token = {
            accessToken: token,
            refreshToken: decoded.refreshToken,
            expiresAt: decoded.exp
        };
        
        // Log authentication
        logger.info('User authenticated', { 
            userId: user.id, 
            username: user.username,
            userAgent: req.get('User-Agent'),
            ip: req.ip
        });
        
        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please refresh your token or sign in again.',
                code: 'TOKEN_EXPIRED'
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please sign in again.',
                code: 'INVALID_TOKEN'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Authentication failed. Please try again.',
                code: 'AUTH_ERROR'
            });
        }
    }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue without authentication
            return next();
        }
        
        // Token provided, authenticate normally
        return authMiddleware(req, res, next);
    } catch (error) {
        // If authentication fails, continue without authentication
        logger.warn('Optional authentication failed, continuing without user', { error: error.message });
        return next();
    }
};

/**
 * Generate JWT tokens
 * @param {Object} user - User object
 * @returns {Object} - Access and refresh tokens
 */
const generateTokens = (user) => {
    const payload = {
        userId: user.id,
        email: user.email,
        username: user.username,
        userType: user.user_type
    };
    
    const accessToken = jwt.sign(payload, JWT_SECRET, { 
        expiresIn: JWT_EXPIRES_IN 
    });
    
    const refreshToken = jwt.sign(
        { ...payload, tokenType: 'refresh' }, 
        REFRESH_TOKEN_SECRET, 
        { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );
    
    return {
        accessToken,
        refreshToken,
        expiresIn: JWT_EXPIRES_IN
    };
};

/**
 * Verify refresh token and generate new access token
 * @param {String} refreshToken - Refresh token
 * @returns {Object} - New tokens
 */
const refreshAccessToken = async (refreshToken) => {
    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        
        // Check if token type is refresh
        if (decoded.tokenType !== 'refresh') {
            throw new Error('Invalid token type');
        }
        
        // Check if user still exists
        const userQuery = await postgresConnection.query(
            'SELECT id, email, username, user_type FROM users WHERE id = $1 AND is_active = true',
            [decoded.userId]
        );
        
        if (userQuery.rows.length === 0) {
            throw new Error('User not found or inactive');
        }
        
        // Generate new tokens
        const user = userQuery.rows[0];
        return generateTokens(user);
    } catch (error) {
        logger.error('Refresh token error:', error);
        throw new Error('Invalid refresh token');
    }
};

/**
 * Check if user has required role
 * @param {Array} roles - Array of allowed roles
 * @returns {Function} - Middleware function
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        
        if (!roles.includes(req.user.userType)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        
        next();
    };
};

/**
 * Rate limiting for authentication endpoints
 */
const authRateLimit = require('express-rate-limit')({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authMiddleware,
    optionalAuth,
    generateTokens,
    refreshAccessToken,
    requireRole,
    authRateLimit,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRES_IN
};