// Clerk Authentication Middleware for Harmony Music Platform
const { clerkClient, getAuth } from '@clerk/clerk-sdk-node';
const { postgresConnection } = require('../config/postgres');
const { getCachedUserProfile, cacheUserSession } = require('../../redis/config');
const logger = require('../utils/logger');

/**
 * Verify Clerk token and extract user information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const clerkAuthMiddleware = async (req, res, next) => {
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
        
        // Verify Clerk token
        const { userId } = getAuth(token);
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please sign in again.'
            });
        }
        
        // Check if user exists in our database
        const userQuery = await postgresConnection.query(
            'SELECT id, clerk_user_id, email, username, full_name, avatar_url, bio, user_type, is_active FROM users WHERE clerk_user_id = $1',
            [userId]
        );
        
        if (userQuery.rows.length === 0) {
            // User not found in our database, get user info from Clerk
            try {
                const clerkUser = await clerkClient.users.getUser(userId);
                
                // Create user in our database
                const newUser = await postgresConnection.query(
                    `INSERT INTO users (clerk_user_id, email, username, full_name, avatar_url, user_type, is_active, email_verified)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     RETURNING id, clerk_user_id, email, username, full_name, avatar_url, bio, user_type, is_active`,
                    [
                        userId,
                        clerkUser.emailAddresses[0]?.emailAddress || null,
                        clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] || null,
                        `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
                        clerkUser.imageUrl || null,
                        'listener', // Default user type
                        true,
                        clerkUser.emailAddresses[0]?.verification?.status === 'verified'
                    ]
                );
                
                const user = newUser.rows[0];
                
                // Cache user session
                await cacheUserSession(user.id, {
                    userId: user.id,
                    clerkUserId: user.clerk_user_id,
                    email: user.email,
                    username: user.username,
                    userType: user.userType
                });
                
                // Add user information to request object
                req.user = {
                    id: user.id,
                    clerkUserId: user.clerk_user_id,
                    email: user.email,
                    username: user.username,
                    fullName: user.full_name,
                    avatarUrl: user.avatar_url,
                    bio: user.bio,
                    userType: user.user_type
                };
                
                // Log authentication
                logger.info('User authenticated via Clerk', { 
                    userId: user.id, 
                    clerkUserId: user.clerk_user_id,
                    username: user.username,
                    userAgent: req.get('User-Agent'),
                    ip: req.ip
                });
                
                next();
            } catch (clerkError) {
                logger.error('Clerk user lookup error:', clerkError);
                return res.status(401).json({
                    success: false,
                    message: 'User not found in Clerk. Please sign in again.'
                });
            }
        } else {
            const user = userQuery.rows[0];
            
            // Check if user is active
            if (!user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated. Please contact support.'
                });
            }
            
            // Cache user session
            await cacheUserSession(user.id, {
                userId: user.id,
                clerkUserId: user.clerk_user_id,
                email: user.email,
                username: user.username,
                userType: user.userType
            });
            
            // Add user information to request object
            req.user = {
                id: user.id,
                clerkUserId: user.clerk_user_id,
                email: user.email,
                username: user.username,
                fullName: user.full_name,
                avatarUrl: user.avatar_url,
                bio: user.bio,
                userType: user.user_type
            };
            
            // Log authentication
            logger.info('User authenticated via Clerk', { 
                userId: user.id, 
                clerkUserId: user.clerk_user_id,
                username: user.username,
                userAgent: req.get('User-Agent'),
                ip: req.ip
            });
            
            next();
        }
    } catch (error) {
        logger.error('Clerk authentication error:', error);
        
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
const optionalClerkAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue without authentication
            return next();
        }
        
        // Token provided, authenticate normally
        return clerkAuthMiddleware(req, res, next);
    } catch (error) {
        // If authentication fails, continue without authentication
        logger.warn('Optional Clerk authentication failed, continuing without user', { error: error.message });
        return next();
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
 * Sync Clerk user with our database
 * @param {String} clerkUserId - Clerk user ID
 * @returns {Object} - Updated user information
 */
const syncClerkUser = async (clerkUserId) => {
    try {
        // Get user from Clerk
        const clerkUser = await clerkClient.users.getUser(clerkUserId);
        
        // Update user in our database
        const updatedUser = await postgresConnection.query(
            `UPDATE users 
             SET email = $1, 
                 username = $2, 
                 full_name = $3, 
                 avatar_url = $4,
                 email_verified = $5
             WHERE clerk_user_id = $6
             RETURNING id, clerk_user_id, email, username, full_name, avatar_url, bio, user_type, is_active`,
            [
                clerkUser.emailAddresses[0]?.emailAddress || null,
                clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] || null,
                `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
                clerkUser.imageUrl || null,
                clerkUser.emailAddresses[0]?.verification?.status === 'verified',
                clerkUserId
            ]
        );
        
        if (updatedUser.rows.length === 0) {
            throw new Error('User not found in database');
        }
        
        const user = updatedUser.rows[0];
        
        // Cache user session
        await cacheUserSession(user.id, {
            userId: user.id,
            clerkUserId: user.clerk_user_id,
            email: user.email,
            username: user.username,
            userType: user.userType
        });
        
        return user;
    } catch (error) {
        logger.error('Clerk user sync error:', error);
        throw error;
    }
};

/**
 * Handle Clerk user deletion
 * @param {String} clerkUserId - Clerk user ID
 */
const handleClerkUserDeletion = async (clerkUserId) => {
    try {
        // Mark user as inactive in our database
        await postgresConnection.query(
            'UPDATE users SET is_active = false WHERE clerk_user_id = $1',
            [clerkUserId]
        );
        
        logger.info('User deactivated due to Clerk deletion', { clerkUserId });
    } catch (error) {
        logger.error('Error handling Clerk user deletion:', error);
        throw error;
    }
};

module.exports = {
    clerkAuthMiddleware,
    optionalClerkAuth,
    requireRole,
    syncClerkUser,
    handleClerkUserDeletion
};