const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { clerkAuthMiddleware } = require('../middleware/clerkAuth');
const premiumFeaturesService = require('../services/premium-features-service');
const logger = require('../utils/logger');

const router = express.Router();

// All premium features routes require authentication
router.use(clerkAuthMiddleware);

/**
 * @route   GET /api/premium/features/access
 * @desc    Check if user has access to premium features
 * @access  Private
 */
router.get('/features/access', async (req, res) => {
    try {
        const userId = req.user.id;
        const access = await premiumFeaturesService.checkPremiumAccess(userId);

        res.json({
            success: true,
            data: access
        });
    } catch (error) {
        logger.error('Check premium access error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check premium access'
        });
    }
});

/**
 * @route   GET /api/premium/ai-generation/priority
 * @desc    Get AI generation priority queue status
 * @access  Private
 */
router.get('/ai-generation/priority', async (req, res) => {
    try {
        const userId = req.user.id;
        const priorityStatus = await premiumFeaturesService.getAIGenerationPriority(userId);

        res.json({
            success: true,
            data: priorityStatus
        });
    } catch (error) {
        logger.error('Get AI generation priority error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get AI generation priority'
        });
    }
});

/**
 * @route   POST /api/premium/ai-generation/priority
 * @desc    Process AI generation with priority
 * @access  Private
 */
router.post('/ai-generation/priority', [
    body('promptData').isObject().withMessage('Prompt data must be an object')
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

        const userId = req.user.id;
        const { promptData } = req.body;

        const result = await premiumFeaturesService.processAIGenerationWithPriority(userId, promptData);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Process AI generation with priority error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process priority AI generation'
        });
    }
});

/**
 * @route   GET /api/premium/prompt-rewriting/enhanced
 * @desc    Get enhanced prompt rewriting options
 * @access  Private
 */
router.get('/prompt-rewriting/enhanced', [
    query('basePrompt').notEmpty().withMessage('Base prompt is required')
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

        const userId = req.user.id;
        const { basePrompt } = req.query;

        const options = await premiumFeaturesService.getEnhancedPromptRewriting(userId, basePrompt);

        res.json({
            success: true,
            data: options
        });
    } catch (error) {
        logger.error('Get enhanced prompt rewriting error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get enhanced prompt rewriting options'
        });
    }
});

/**
 * @route   GET /api/premium/analytics/dashboard
 * @desc    Get analytics dashboard data
 * @access  Private
 */
router.get('/analytics/dashboard', [
    query('period').optional().isIn(['daily', 'weekly', 'monthly', 'yearly'])
        .withMessage('Period must be daily, weekly, monthly, or yearly')
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

        const userId = req.user.id;
        const { period = 'monthly' } = req.query;

        const analytics = await premiumFeaturesService.getAnalyticsDashboard(userId);

        res.json({
            success: true,
            data: {
                ...analytics,
                period
            }
        });
    } catch (error) {
        logger.error('Get analytics dashboard error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get analytics dashboard'
        });
    }
});

/**
 * @route   GET /api/premium/early-access/features
 * @desc    Get early access features
 * @access  Private
 */
router.get('/early-access/features', async (req, res) => {
    try {
        const userId = req.user.id;
        const features = await premiumFeaturesService.getEarlyAccessFeatures(userId);

        res.json({
            success: true,
            data: features
        });
    } catch (error) {
        logger.error('Get early access features error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get early access features'
        });
    }
});

/**
 * @route   POST /api/premium/early-access/feedback
 * @desc    Submit feedback for early access features
 * @access  Private
 */
router.post('/early-access/feedback', [
    body('featureId').notEmpty().withMessage('Feature ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comments').optional().isString().withMessage('Comments must be a string'),
    body('suggestions').optional().isString().withMessage('Suggestions must be a string')
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

        const userId = req.user.id;
        const { featureId, rating, comments, suggestions } = req.body;

        const feedback = {
            featureId,
            rating,
            comments,
            suggestions
        };

        const result = await premiumFeaturesService.submitEarlyAccessFeedback(userId, featureId, feedback);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Submit early access feedback error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to submit early access feedback'
        });
    }
});

/**
 * @route   GET /api/premium/custom-tracks/requests
 * @desc    Get custom track requests from fans
 * @access  Private
 */
router.get('/custom-tracks/requests', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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

        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const requests = await premiumFeaturesService.getCustomTrackRequests(userId);

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        logger.error('Get custom track requests error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get custom track requests'
        });
    }
});

/**
 * @route   PUT /api/premium/custom-tracks/requests/:requestId
 * @desc    Process custom track request
 * @access  Private
 */
router.put('/custom-tracks/requests/:requestId', [
    body('action').isIn(['accepted', 'rejected']).withMessage('Action must be accepted or rejected'),
    body('responseText').optional().isString().withMessage('Response text must be a string')
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

        const userId = req.user.id;
        const { requestId } = req.params;
        const { action, responseText } = req.body;

        const result = await premiumFeaturesService.processCustomTrackRequest(
            userId, 
            requestId, 
            action, 
            responseText
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Process custom track request error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process custom track request'
        });
    }
});

/**
 * @route   GET /api/premium/download-quality
 * @desc    Get available download quality options
 * @access  Private
 */
router.get('/download-quality', async (req, res) => {
    try {
        const userId = req.user.id;
        const access = await premiumFeaturesService.checkPremiumAccess(userId);

        if (!access.hasAccess) {
            return res.json({
                success: true,
                data: {
                    availableQualities: ['standard'],
                    currentQuality: 'standard',
                    maxQuality: 'standard',
                    message: 'Upgrade to premium for higher quality downloads'
                }
            });
        }

        let qualities = ['standard', 'high'];
        let maxQuality = 'high';

        if (access.tier === 'creator') {
            qualities = ['standard', 'high', 'lossless'];
            maxQuality = 'lossless';
        }

        res.json({
            success: true,
            data: {
                availableQualities: qualities,
                currentQuality: 'high', // Default for premium users
                maxQuality,
                message: `Download up to ${maxQuality} quality with your ${access.tier} subscription`
            }
        });
    } catch (error) {
        logger.error('Get download quality options error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get download quality options'
        });
    }
});

/**
 * @route   POST /api/premium/api-access/generate-key
 * @desc    Generate API access key (Creator tier only)
 * @access  Private
 */
router.post('/api-access/generate-key', async (req, res) => {
    try {
        const userId = req.user.id;
        const access = await premiumFeaturesService.checkPremiumAccess(userId);

        if (access.tier !== 'creator') {
            return res.status(403).json({
                success: false,
                message: 'API access requires a Creator subscription'
            });
        }

        // Generate API key
        const crypto = require('crypto');
        const apiKey = crypto.randomBytes(32).toString('hex');
        
        // Store API key in database (hashed)
        const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
        
        const keyQuery = await premiumFeaturesService.db.query(
            `INSERT INTO api_keys 
             (user_id, key_hash, name, permissions, created_at, expires_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 year')
             RETURNING *`,
            [userId, apiKeyHash, 'Default API Key', 'read:tracks,write:tracks,read:analytics', new Date()]
        );

        logger.info('API key generated', { userId, keyId: keyQuery.rows[0].id });

        res.status(201).json({
            success: true,
            message: 'API key generated successfully',
            data: {
                apiKey, // Only shown once
                keyId: keyQuery.rows[0].id,
                name: keyQuery.rows[0].name,
                permissions: keyQuery.rows[0].permissions,
                expiresAt: keyQuery.rows[0].expires_at
            }
        });
    } catch (error) {
        logger.error('Generate API key error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate API key'
        });
    }
});

/**
 * @route   GET /api/premium/api-access/keys
 * @desc    Get user's API access keys (Creator tier only)
 * @access  Private
 */
router.get('/api-access/keys', async (req, res) => {
    try {
        const userId = req.user.id;
        const access = await premiumFeaturesService.checkPremiumAccess(userId);

        if (access.tier !== 'creator') {
            return res.status(403).json({
                success: false,
                message: 'API access requires a Creator subscription'
            });
        }

        const keysQuery = await premiumFeaturesService.db.query(
            `SELECT 
                 id, name, permissions, created_at, expires_at, last_used,
                 CASE WHEN key_hash IS NOT NULL THEN 'active' ELSE 'revoked' END as status
             FROM api_keys 
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: keysQuery.rows
        });
    } catch (error) {
        logger.error('Get API keys error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get API keys'
        });
    }
});

/**
 * @route   DELETE /api/premium/api-access/keys/:keyId
 * @desc    Revoke API access key (Creator tier only)
 * @access  Private
 */
router.delete('/api-access/keys/:keyId', async (req, res) => {
    try {
        const userId = req.user.id;
        const { keyId } = req.params;
        const access = await premiumFeaturesService.checkPremiumAccess(userId);

        if (access.tier !== 'creator') {
            return res.status(403).json({
                success: false,
                message: 'API access requires a Creator subscription'
            });
        }

        // Check if key belongs to user
        const keyQuery = await premiumFeaturesService.db.query(
            'SELECT id FROM api_keys WHERE id = $1 AND user_id = $2',
            [keyId, userId]
        );

        if (keyQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'API key not found'
            });
        }

        // Revoke key by setting key_hash to null
        await premiumFeaturesService.db.query(
            'UPDATE api_keys SET key_hash = NULL WHERE id = $1',
            [keyId]
        );

        logger.info('API key revoked', { userId, keyId });

        res.json({
            success: true,
            message: 'API key revoked successfully'
        });
    } catch (error) {
        logger.error('Revoke API key error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to revoke API key'
        });
    }
});

module.exports = router;