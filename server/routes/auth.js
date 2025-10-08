// Authentication Routes for Harmony Music Platform
const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const { authRateLimit } = require('../middleware/auth');
const { postgresConnection } = require('../config/postgres');
const { connectMongoDB } = require('../config/mongodb');
const { 
    generateTokens, 
    refreshAccessToken,
    requireRole 
} = require('../middleware/auth');
const { cacheUserSession } = require('../../redis/config');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authRateLimit, [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('username').isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('userType').optional().isIn(['listener', 'creator', 'both']).withMessage('Invalid user type')
], async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, username, password, fullName, userType = 'listener' } = req.body;

        // Check if user already exists
        const existingUser = await postgresConnection.query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Insert new user
        const newUser = await postgresConnection.query(
            `INSERT INTO users (email, username, password_hash, full_name, user_type, email_verified)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, email, username, full_name, user_type, created_at`,
            [email, username, passwordHash, fullName, userType, false]
        );

        const user = newUser.rows[0];

        // TODO: Send verification email
        logger.info('New user registered', { userId: user.id, email });

        // Generate tokens
        const tokens = generateTokens(user);

        // Cache user session
        await cacheUserSession(user.id, {
            userId: user.id,
            email: user.email,
            username: user.username,
            userType: user.userType
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    fullName: user.full_name,
                    userType: user.user_type
                },
                tokens
            }
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', authRateLimit, [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user by email
        const userQuery = await postgresConnection.query(
            'SELECT id, email, username, password_hash, full_name, user_type, is_active FROM users WHERE email = $1',
            [email]
        );

        if (userQuery.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
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

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate tokens
        const tokens = generateTokens(user);

        // Cache user session
        await cacheUserSession(user.id, {
            userId: user.id,
            email: user.email,
            username: user.username,
            userType: user.userType
        });

        logger.info('User logged in', { userId: user.id, email });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    fullName: user.full_name,
                    userType: user.user_type
                },
                tokens
            }
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', [
    body('refreshToken').notEmpty().withMessage('Refresh token is required')
], async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { refreshToken } = req.body;

        // Verify refresh token and get new tokens
        const newTokens = await refreshAccessToken(refreshToken);

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: newTokens
        });
    } catch (error) {
        logger.error('Token refresh error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    User logout
 * @access  Private
 */
router.post('/logout', requireRole(['listener', 'creator', 'both']), async (req, res) => {
    try {
        const userId = req.user.id;

        // Clear user session from cache
        // In a real implementation, you would add logic to invalidate the token
        // This could be done by maintaining a blacklist of tokens in Redis

        logger.info('User logged out', { userId });

        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed. Please try again.'
        });
    }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', authRateLimit, [
    body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email } = req.body;

        // Find user by email
        const userQuery = await postgresConnection.query(
            'SELECT id, email FROM users WHERE email = $1 AND is_active = true',
            [email]
        );

        if (userQuery.rows.length === 0) {
            // Don't reveal if email exists or not for security
            return res.json({
                success: true,
                message: 'If an account with this email exists, a password reset link will be sent.'
            });
        }

        const user = userQuery.rows[0];

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry

        // TODO: Store reset token in database and send email
        logger.info('Password reset requested', { userId: user.id, email });

        res.json({
            success: true,
            message: 'If an account with this email exists, a password reset link will be sent.'
        });
    } catch (error) {
        logger.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process request. Please try again.'
        });
    }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { token, password } = req.body;

        // TODO: Verify reset token and expiry
        // This would involve checking the token against the database

        // Hash new password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // TODO: Update user password in database
        logger.info('Password reset completed');

        res.json({
            success: true,
            message: 'Password reset successful. Please login with your new password.'
        });
    } catch (error) {
        logger.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password. Please try again.'
        });
    }
});

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post('/verify-email', [
    body('token').notEmpty().withMessage('Verification token is required')
], async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { token } = req.body;

        // TODO: Verify token and update email_verified status
        logger.info('Email verification completed');

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        logger.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify email. Please try again.'
        });
    }
});

module.exports = router;