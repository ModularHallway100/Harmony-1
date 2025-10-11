const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { clerkAuthMiddleware, optionalClerkAuth } = require('../middleware/clerkAuth');
const fanSubscriptionService = require('../services/fan-subscription-service');
const logger = require('../utils/logger');

const router = express.Router();

// Most fan subscription routes require authentication
router.use(clerkAuthMiddleware);

/**
 * @route   GET /api/fan-subscriptions/tiers/:artistId
 * @desc    Get available fan subscription tiers for an artist
 * @access  Private
 */
router.get('/tiers/:artistId', async (req, res) => {
    try {
        const { artistId } = req.params;
        const fanId = req.user.id;

        const tiers = await fanSubscriptionService.getArtistSubscriptionTiers(artistId);

        res.json({
            success: true,
            data: tiers
        });
    } catch (error) {
        logger.error('Get artist subscription tiers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get artist subscription tiers'
        });
    }
});

/**
 * @route   POST /api/fan-subscriptions
 * @desc    Create a fan subscription
 * @access  Private
 */
router.post('/', [
    body('artistId').notEmpty().withMessage('Artist ID is required'),
    body('tierId').notEmpty().withMessage('Tier ID is required'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('platformPercentage').optional().isFloat({ min: 0, max: 1 }).withMessage('Platform percentage must be between 0 and 1')
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

        const fanId = req.user.id;
        const { artistId, tierId, price, platformPercentage } = req.body;

        const subscription = await fanSubscriptionService.createFanSubscription(
            fanId, 
            artistId, 
            tierId, 
            price, 
            platformPercentage
        );

        res.status(201).json({
            success: true,
            message: 'Fan subscription created successfully',
            data: subscription
        });
    } catch (error) {
        logger.error('Create fan subscription error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create fan subscription'
        });
    }
});

/**
 * @route   GET /api/fan-subscriptions/my-subscriptions
 * @desc    Get current user's fan subscriptions
 * @access  Private
 */
router.get('/my-subscriptions', async (req, res) => {
    try {
        const fanId = req.user.id;
        const subscriptions = await fanSubscriptionService.getFanSubscriptions(fanId);

        res.json({
            success: true,
            data: subscriptions
        });
    } catch (error) {
        logger.error('Get fan subscriptions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get fan subscriptions'
        });
    }
});

/**
 * @route   GET /api/fan-subscriptions/exclusive-content
 * @desc    Get exclusive content for current user
 * @access  Private
 */
router.get('/exclusive-content', async (req, res) => {
    try {
        const fanId = req.user.id;
        const content = await fanSubscriptionService.getFanExclusiveContent(fanId);

        res.json({
            success: true,
            data: content
        });
    } catch (error) {
        logger.error('Get fan exclusive content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get fan exclusive content'
        });
    }
});

/**
 * @route   DELETE /api/fan-subscriptions/:subscriptionId
 * @desc    Cancel a fan subscription
 * @access  Private
 */
router.delete('/:subscriptionId', async (req, res) => {
    try {
        const fanId = req.user.id;
        const { subscriptionId } = req.params;

        const result = await fanSubscriptionService.cancelFanSubscription(fanId, subscriptionId);

        res.json({
            success: true,
            message: 'Fan subscription canceled successfully',
            data: result
        });
    } catch (error) {
        logger.error('Cancel fan subscription error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to cancel fan subscription'
        });
    }
});

/**
 * @route   GET /api/fan-subscriptions/benefits/:subscriptionId
 * @desc    Get benefits for a fan subscription
 * @access  Private
 */
router.get('/benefits/:subscriptionId', async (req, res) => {
    try {
        const fanId = req.user.id;
        const { subscriptionId } = req.params;

        // Check if subscription belongs to user
        const subscription = await fanSubscriptionService.db.query(
            'SELECT * FROM fan_subscriptions WHERE id = $1 AND fan_id = $2',
            [subscriptionId, fanId]
        );

        if (subscription.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        const benefits = await fanSubscriptionService.getFanSubscriptionBenefits(subscriptionId);

        res.json({
            success: true,
            data: benefits
        });
    } catch (error) {
        logger.error('Get fan subscription benefits error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get fan subscription benefits'
        });
    }
});

/**
 * @route   POST /api/fan-subscriptions/benefits/:benefitId/claim
 * @desc    Claim a fan subscription benefit
 * @access  Private
 */
router.post('/benefits/:benefitId/claim', async (req, res) => {
    try {
        const fanId = req.user.id;
        const { benefitId } = req.params;

        // First get the benefit to check which subscription it belongs to
        const benefit = await fanSubscriptionService.db.query(
            'SELECT * FROM fan_subscription_benefits WHERE id = $1',
            [benefitId]
        );

        if (benefit.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Benefit not found'
            });
        }

        const subscriptionId = benefit.rows[0].fan_subscription_id;

        // Check if subscription belongs to user
        const subscription = await fanSubscriptionService.db.query(
            'SELECT * FROM fan_subscriptions WHERE id = $1 AND fan_id = $2',
            [subscriptionId, fanId]
        );

        if (subscription.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to claim this benefit'
            });
        }

        const result = await fanSubscriptionService.claimFanSubscriptionBenefit(subscriptionId, benefitId);

        res.json({
            success: true,
            message: 'Benefit claimed successfully',
            data: result
        });
    } catch (error) {
        logger.error('Claim fan subscription benefit error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to claim fan subscription benefit'
        });
    }
});

// Routes for artists (require creator role)
/**
 * @route   GET /api/fan-subscriptions/artist/:artistId/subscribers
 * @desc    Get artist's subscribers
 * @access  Private (Artist/Creator only)
 */
router.get('/artist/:artistId/subscribers', [
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

        const { artistId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        // Check if user is the artist or has permission
        if (req.user.id !== artistId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view these subscribers'
            });
        }

        const result = await fanSubscriptionService.getArtistSubscribers(artistId, page, limit);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Get artist subscribers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get artist subscribers'
        });
    }
});

/**
 * @route   GET /api/fan-subscriptions/artist/:artistId/revenue
 * @desc    Get artist's revenue
 * @access  Private (Artist/Creator only)
 */
router.get('/artist/:artistId/revenue', [
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

        const { artistId } = req.params;
        const { period = 'monthly' } = req.query;

        // Check if user is the artist or has permission
        if (req.user.id !== artistId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this revenue'
            });
        }

        const revenue = await fanSubscriptionService.getArtistRevenue(artistId, period);

        res.json({
            success: true,
            data: revenue
        });
    } catch (error) {
        logger.error('Get artist revenue error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get artist revenue'
        });
    }
});

/**
 * @route   POST /api/fan-subscriptions/artist/:artistId/exclusive-content
 * @desc    Create exclusive content for artist
 * @access  Private (Artist/Creator only)
 */
router.post('/artist/:artistId/exclusive-content', [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('contentType').notEmpty().isIn(['track', 'video', 'image', 'document', 'text'])
        .withMessage('Content type must be track, video, image, document, or text'),
    body('contentUrl').optional().isURL().withMessage('Content URL must be a valid URL'),
    body('contentData').optional().isObject().withMessage('Content data must be an object'),
    body('isPublic').optional().isBoolean().withMessage('Is public must be a boolean'),
    body('subscriptionTierRequired').optional().isString().withMessage('Subscription tier required must be a string'),
    body('fanSubscriptionRequired').optional().isBoolean().withMessage('Fan subscription required must be a boolean')
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

        const { artistId } = req.params;
        const contentData = req.body;

        // Check if user is the artist or has permission
        if (req.user.id !== artistId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to create content for this artist'
            });
        }

        const content = await fanSubscriptionService.createExclusiveContent(artistId, contentData);

        res.status(201).json({
            success: true,
            message: 'Exclusive content created successfully',
            data: content
        });
    } catch (error) {
        logger.error('Create exclusive content error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create exclusive content'
        });
    }
});

/**
 * @route   GET /api/fan-subscriptions/artist/:artistId/exclusive-content
 * @desc    Get artist's exclusive content
 * @access  Private (Artist/Creator only)
 */
router.get('/artist/:artistId/exclusive-content', [
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

        const { artistId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        // Check if user is the artist or has permission
        if (req.user.id !== artistId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this content'
            });
        }

        const result = await fanSubscriptionService.getArtistExclusiveContent(artistId, page, limit);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Get artist exclusive content error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get artist exclusive content'
        });
    }
});

// Public routes for viewing artist subscription info
/**
 * @route   GET /api/fan-subscriptions/public/:artistId
 * @desc    Get public subscription info for an artist
 * @access  Public
 */
router.get('/public/:artistId', optionalClerkAuth, async (req, res) => {
    try {
        const { artistId } = req.params;
        
        // Check if artist exists
        const artist = await fanSubscriptionService.db.query(
            'SELECT * FROM artists WHERE id = $1 AND user_id IS NOT NULL',
            [artistId]
        );
        
        if (artist.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Artist not found or not a creator'
            });
        }
        
        // Get subscriber count
        const subscriberCount = await fanSubscriptionService.db.query(
            'SELECT COUNT(*) as count FROM fan_subscriptions WHERE artist_id = $1 AND status = \'active\'',
            [artistId]
        );
        
        // Get available tiers
        const tiers = await fanSubscriptionService.getArtistSubscriptionTiers(artistId);
        
        // Check if current user is subscribed (if authenticated)
        let isSubscribed = false;
        if (req.user && req.user.id) {
            const userSubscription = await fanSubscriptionService.db.query(
                'SELECT id FROM fan_subscriptions WHERE fan_id = $1 AND artist_id = $2 AND status = \'active\'',
                [req.user.id, artistId]
            );
            isSubscribed = userSubscription.rows.length > 0;
        }
        
        res.json({
            success: true,
            data: {
                artist: artist.rows[0],
                subscriberCount: parseInt(subscriberCount.rows[0].count),
                availableTiers: tiers,
                isSubscribed
            }
        });
    } catch (error) {
        logger.error('Get public subscription info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get public subscription info'
        });
    }
});

module.exports = router;