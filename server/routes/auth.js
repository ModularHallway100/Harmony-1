const express = require('express');
const { body, validationResult } = require('express-validator');
const { authRateLimit, requireRole } = require('../middleware/auth');
const authService = require('../services/auth-service');
const logger = require('../utils/logger');

const router = express.Router();


router.post('/register', authRateLimit, [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('username').isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('userType').optional().isIn(['listener', 'creator', 'both']).withMessage('Invalid user type')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { user, tokens } = await authService.register(req.body);
        res.status(201).json({ user, tokens });
    } catch (error) {
        next(error);
    }
});

router.post('/login', authRateLimit, [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { user, tokens } = await authService.login(req.body);
        res.json({ user, tokens });
    } catch (error) {
        next(error);
    }
});

router.post('/refresh', [
    body('refreshToken').notEmpty().withMessage('Refresh token is required')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const newTokens = await authService.refresh(req.body.refreshToken);
        res.json(newTokens);
    } catch (error) {
        next(error);
    }
});

router.post('/logout', requireRole(['listener', 'creator', 'both']), async (req, res, next) => {
    try {
        await authService.logout(req.user.id);
        res.json({ message: 'Logout successful' });
    } catch (error) {
        next(error);
    }
});

router.post('/forgot-password', authRateLimit, [
    body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await authService.forgotPassword(req.body.email);
        res.json({ message: 'If an account with this email exists, a password reset link will be sent.' });
    } catch (error) {
        next(error);
    }
});

router.post('/reset-password', [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await authService.resetPassword(req.body.token, req.body.password);
        res.json({ message: 'Password reset successful. Please login with your new password.' });
    } catch (error) {
        next(error);
    }
});

router.post('/verify-email', [
    body('token').notEmpty().withMessage('Verification token is required')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await authService.verifyEmail(req.body.token);
        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        next(error);
    }
});


module.exports = (db) => {
    authService.initialize(db);
    return router;
};