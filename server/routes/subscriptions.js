const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { clerkAuthMiddleware } = require('../middleware/clerkAuth');
const subscriptionService = require('../services/subscription-service');
const stripeService = require('../services/stripe-service');
const logger = require('../utils/logger');

const router = express.Router();

// All subscription routes require authentication
router.use(clerkAuthMiddleware);

/**
 * @route   GET /api/subscriptions/tiers
 * @desc    Get available subscription tiers
 * @access  Private
 */
router.get('/tiers', async (req, res) => {
    try {
        const tiers = await subscriptionService.getSubscriptionTiers();
        res.json({
            success: true,
            data: tiers
        });
    } catch (error) {
        logger.error('Get subscription tiers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get subscription tiers'
        });
    }
});

/**
 * @route   GET /api/subscriptions/current
 * @desc    Get current user subscription
 * @access  Private
 */
router.get('/current', async (req, res) => {
    try {
        const userId = req.user.id;
        const subscription = await subscriptionService.getUserSubscription(userId);
        const status = await subscriptionService.getSubscriptionStatus(userId);
        
        res.json({
            success: true,
            data: {
                subscription,
                status
            }
        });
    } catch (error) {
        logger.error('Get current subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get current subscription'
        });
    }
});

/**
 * @route   POST /api/subscriptions/create
 * @desc    Create a new subscription
 * @access  Private
 */
router.post('/create', [
    body('planId').notEmpty().withMessage('Plan ID is required'),
    body('paymentMethodId').optional().isString().withMessage('Payment method ID must be a string')
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
        const { planId, paymentMethodId } = req.body;

        // Check if user already has an active subscription
        const currentSubscription = await subscriptionService.getUserSubscription(userId);
        if (currentSubscription) {
            return res.status(400).json({
                success: false,
                message: 'User already has an active subscription'
            });
        }

        // In a real implementation, you would:
        // 1. Create a Stripe subscription
        // 2. Handle payment processing
        // 3. Create the subscription in our database

        // For now, we'll create the subscription directly
        const subscription = await subscriptionService.createUserSubscription(userId, planId, paymentMethodId);

        res.status(201).json({
            success: true,
            message: 'Subscription created successfully',
            data: subscription
        });
    } catch (error) {
        logger.error('Create subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create subscription'
        });
    }
});

/**
 * @route   PUT /api/subscriptions/cancel
 * @desc    Cancel current subscription
 * @access  Private
 */
router.put('/cancel', [
    body('subscriptionId').notEmpty().withMessage('Subscription ID is required')
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
        const { subscriptionId } = req.body;

        const result = await subscriptionService.cancelUserSubscription(userId, subscriptionId);

        res.json({
            success: true,
            message: 'Subscription canceled successfully',
            data: result
        });
    } catch (error) {
        logger.error('Cancel subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel subscription'
        });
    }
});

/**
 * @route   PUT /api/subscriptions/change-plan
 * @desc    Change subscription plan
 * @access  Private
 */
router.put('/change-plan', [
    body('newPlanId').notEmpty().withMessage('New plan ID is required'),
    body('subscriptionId').notEmpty().withMessage('Subscription ID is required')
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
        const { newPlanId, subscriptionId } = req.body;

        const updatedSubscription = await subscriptionService.changeSubscriptionPlan(userId, newPlanId);

        res.json({
            success: true,
            message: 'Subscription plan changed successfully',
            data: updatedSubscription
        });
    } catch (error) {
        logger.error('Change subscription plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change subscription plan'
        });
    }
});

/**
 * @route   POST /api/subscriptions/payment-methods
 * @desc    Add a new payment method
 * @access  Private
 */
router.post('/payment-methods', [
    body('provider').notEmpty().withMessage('Payment provider is required'),
    body('providerPaymentMethodId').notEmpty().withMessage('Provider payment method ID is required'),
    body('lastFourDigits').notEmpty().withMessage('Last four digits are required'),
    body('expiryMonth').isInt({ min: 1, max: 12 }).withMessage('Expiry month must be between 1 and 12'),
    body('expiryYear').isInt({ min: 2023 }).withMessage('Expiry year must be a valid year'),
    body('cardType').notEmpty().withMessage('Card type is required'),
    body('isDefault').optional().isBoolean().withMessage('Is default must be a boolean')
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
        const paymentMethodData = req.body;

        const paymentMethod = await subscriptionService.addPaymentMethod(userId, paymentMethodData);

        res.status(201).json({
            success: true,
            message: 'Payment method added successfully',
            data: paymentMethod
        });
    } catch (error) {
        logger.error('Add payment method error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add payment method'
        });
    }
});

/**
 * @route   GET /api/subscriptions/payment-methods
 * @desc    Get user's payment methods
 * @access  Private
 */
router.get('/payment-methods', async (req, res) => {
    try {
        const userId = req.user.id;
        const paymentMethods = await subscriptionService.getPaymentMethods(userId);

        res.json({
            success: true,
            data: paymentMethods
        });
    } catch (error) {
        logger.error('Get payment methods error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment methods'
        });
    }
});

/**
 * @route   DELETE /api/subscriptions/payment-methods/:id
 * @desc    Delete a payment method
 * @access  Private
 */
router.delete('/payment-methods/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Check if payment method exists and belongs to user
        const paymentMethod = await subscriptionService.db.query(
            'SELECT * FROM payment_methods WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (paymentMethod.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment method not found'
            });
        }

        // Don't allow deletion if it's the only payment method
        const allPaymentMethods = await subscriptionService.getPaymentMethods(userId);
        if (allPaymentMethods.length === 1) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete the only payment method'
            });
        }

        await subscriptionService.db.query(
            'DELETE FROM payment_methods WHERE id = $1',
            [id]
        );

        res.json({
            success: true,
            message: 'Payment method deleted successfully'
        });
    } catch (error) {
        logger.error('Delete payment method error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete payment method'
        });
    }
});

/**
 * @route   GET /api/subscriptions/usage
 * @desc    Get user's usage metrics
 * @access  Private
 */
router.get('/usage', [
    query('metricType').optional().isIn(['ai_generations', 'track_uploads', 'prompt_refinements', 'storage_usage'])
        .withMessage('Invalid metric type')
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
        const { metricType } = req.query;

        let usage;
        if (metricType) {
            usage = await subscriptionService.getUserUsage(userId, metricType);
            
            // Get limit information
            const limitInfo = await subscriptionService.checkUsageLimit(userId, metricType);
            
            res.json({
                success: true,
                data: {
                    metricType,
                    usage,
                    limit: limitInfo.limit,
                    remaining: limitInfo.remaining
                }
            });
        } else {
            usage = await subscriptionService.getUserUsage(userId);
            
            // Get limit information for all metrics
            const limitPromises = usage.map(item => 
                subscriptionService.checkUsageLimit(userId, item.metric_type)
            );
            const limits = await Promise.all(limitPromises);
            
            const usageWithLimits = usage.map((item, index) => ({
                ...item,
                limit: limits[index].limit,
                remaining: limits[index].remaining
            }));
            
            res.json({
                success: true,
                data: usageWithLimits
            });
        }
    } catch (error) {
        logger.error('Get usage error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get usage metrics'
        });
    }
});

/**
 * @route   POST /api/subscriptions/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (with webhook secret verification)
 */
router.post('/webhook', async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        
        // Verify webhook signature
        const event = stripeService.verifyWebhookSignature(req.body, signature);
        
        // Handle different event types
        switch (event.type) {
            case 'invoice.payment_succeeded':
                await subscriptionService.handleInvoicePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                await subscriptionService.handleInvoicePaymentFailed(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await subscriptionService.handleSubscriptionDeleted(event.data.object);
                break;
            case 'customer.subscription.updated':
                await subscriptionService.handleSubscriptionUpdated(event.data.object);
                break;
            default:
                logger.info('Unhandled webhook event type:', { type: event.type });
        }
        
        res.json({ received: true });
    } catch (error) {
        logger.error('Webhook error:', error);
        res.status(400).json({ error: 'Webhook handler failed' });
    }
});

module.exports = router;