const subscriptionService = require('../services/subscription-service');
const logger = require('../utils/logger');

/**
 * Middleware to check if user has reached upload limit
 * @param {string} metricType - The type of metric to check ('track_uploads', 'ai_generations', etc.)
 * @param {boolean} strict - Whether to strictly enforce the limit (return 403) or just warn (return 200 with limit info)
 */
const checkUsageLimit = (metricType, strict = true) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            
            // Get user's subscription and usage
            const limitInfo = await subscriptionService.checkUsageLimit(userId, metricType);
            
            // Add limit info to request for use in route handlers
            req.usageLimit = limitInfo;
            
            if (strict && limitInfo.used >= limitInfo.limit && limitInfo.limit > 0) {
                return res.status(403).json({
                    success: false,
                    message: `You have reached your ${metricType} limit for this period`,
                    data: {
                        metricType,
                        used: limitInfo.used,
                        limit: limitInfo.limit,
                        remaining: 0
                    }
                });
            }
            
            // If not strict or under limit, continue
            next();
        } catch (error) {
            logger.error('Check usage limit middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to check usage limit'
            });
        }
    };
};

/**
 * Middleware to check if user has a specific subscription tier
 * @param {string} tier - The required tier ('free', 'premium', 'creator')
 */
const requireSubscriptionTier = (tier) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            
            // Get user's subscription status
            const status = await subscriptionService.getSubscriptionStatus(userId);
            
            if (status.status === 'none' || status.tier !== tier) {
                return res.status(403).json({
                    success: false,
                    message: `This feature requires a ${tier} subscription`,
                    data: {
                        currentTier: status.tier,
                        requiredTier: tier
                    }
                });
            }
            
            // Add subscription info to request
            req.subscription = status;
            next();
        } catch (error) {
            logger.error('Check subscription tier middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to check subscription tier'
            });
        }
    };
};

/**
 * Middleware to check if user has any active subscription
 */
const requireActiveSubscription = () => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            
            // Get user's subscription status
            const status = await subscriptionService.getSubscriptionStatus(userId);
            
            if (status.status === 'none') {
                return res.status(403).json({
                    success: false,
                    message: 'This feature requires an active subscription',
                    data: {
                        currentTier: status.tier
                    }
                });
            }
            
            // Add subscription info to request
            req.subscription = status;
            next();
        } catch (error) {
            logger.error('Check active subscription middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to check active subscription'
            });
        }
    };
};

/**
 * Middleware to increment usage after successful operation
 * @param {string} metricType - The type of metric to increment
 */
const incrementUsage = (metricType) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            
            // Only increment if the operation was successful
            if (res.locals.operationSuccess !== false) {
                await subscriptionService.incrementUsage(userId, metricType);
                logger.info(`Usage incremented for ${metricType}`, { userId });
            }
            
            next();
        } catch (error) {
            logger.error('Increment usage middleware error:', error);
            // Don't fail the request if usage tracking fails
            next();
        }
    };
};

/**
 * Middleware to check if user is a creator (for fan subscription features)
 */
const requireCreatorRole = () => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            
            // Get user profile to check if they have creator role
            const userQuery = await subscriptionService.db.query(
                'SELECT user_type FROM users WHERE id = $1',
                [userId]
            );
            
            if (userQuery.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            const userType = userQuery.rows[0].user_type;
            
            if (!userType.includes('creator')) {
                return res.status(403).json({
                    success: false,
                    message: 'This feature requires creator permissions'
                });
            }
            
            // Add user type to request
            req.userType = userType;
            next();
        } catch (error) {
            logger.error('Check creator role middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to check creator role'
            });
        }
    };
};

/**
 * Middleware to check if user has access to exclusive content
 * This can be used for both platform-wide exclusive content and artist-specific content
 */
const checkExclusiveContentAccess = () => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            
            // Get user's subscription status
            const status = await subscriptionService.getSubscriptionStatus(userId);
            
            // Check if user has premium or creator tier
            if (status.tier === 'free') {
                return res.status(403).json({
                    success: false,
                    message: 'This content is exclusive to premium subscribers',
                    data: {
                        currentTier: status.tier,
                        requiredTier: 'premium'
                    }
                });
            }
            
            // Add subscription info to request
            req.subscription = status;
            next();
        } catch (error) {
            logger.error('Check exclusive content access middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to check exclusive content access'
            });
        }
    };
};

/**
 * Middleware to check if user has access to artist's exclusive content
 * @param {string} artistIdParam - The parameter name containing the artist ID (default: 'artistId')
 */
const checkArtistExclusiveContentAccess = (artistIdParam = 'artistId') => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const artistId = req.params[artistIdParam];
            
            // Check if user has premium subscription
            const status = await subscriptionService.getSubscriptionStatus(userId);
            
            if (status.tier === 'free') {
                return res.status(403).json({
                    success: false,
                    message: 'This content is exclusive to premium subscribers',
                    data: {
                        currentTier: status.tier,
                        requiredTier: 'premium'
                    }
                });
            }
            
            // Check if user has a direct fan subscription to this artist
            const fanSubscription = await subscriptionService.db.query(
                'SELECT id FROM fan_subscriptions WHERE fan_id = $1 AND artist_id = $2 AND status = \'active\'',
                [userId, artistId]
            );
            
            // Add subscription info to request
            req.subscription = status;
            req.hasFanSubscription = fanSubscription.rows.length > 0;
            
            next();
        } catch (error) {
            logger.error('Check artist exclusive content access middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to check artist exclusive content access'
            });
        }
    };
};

/**
 * Rate limiting middleware for premium features
 * @param {number} requests - Number of requests allowed in the window
 * @param {number} windowMs - Time window in milliseconds
 */
const premiumRateLimit = (requests = 100, windowMs = 15 * 60 * 1000) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            
            // Get user's subscription status
            const status = await subscriptionService.getSubscriptionStatus(userId);
            
            // Free users get stricter rate limiting
            if (status.tier === 'free') {
                const freeRequests = Math.floor(requests / 4); // 25% of premium limit
                const freeWindowMs = windowMs / 2; // Half the window
                
                // Implement free user rate limiting
                // This would typically use a Redis-based rate limiter
                // For now, we'll just check and warn
                logger.warn('Free user rate limit check', { userId, requests: freeRequests });
                
                // In a real implementation, you would track requests and enforce limits
                if (req.rateLimit && req.rateLimit.remaining < freeRequests) {
                    return res.status(429).json({
                        success: false,
                        message: 'Too many requests. Please upgrade to premium for higher limits.',
                        data: {
                            currentTier: status.tier,
                            requiredTier: 'premium',
                            resetTime: new Date(Date.now() + freeWindowMs)
                        }
                    });
                }
            }
            
            next();
        } catch (error) {
            logger.error('Premium rate limit middleware error:', error);
            next();
        }
    };
};

module.exports = {
    checkUsageLimit,
    requireSubscriptionTier,
    requireActiveSubscription,
    incrementUsage,
    requireCreatorRole,
    checkExclusiveContentAccess,
    checkArtistExclusiveContentAccess,
    premiumRateLimit
};