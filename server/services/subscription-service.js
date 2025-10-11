const { postgresConnection } = require('../config/postgres');
const logger = require('../utils/logger');

class SubscriptionService {
    constructor() {
        this.db = postgresConnection;
    }

    // Subscription Tier Management
    async getSubscriptionTiers() {
        try {
            const query = await this.db.query(
                'SELECT * FROM subscription_tiers WHERE is_active = true ORDER BY price ASC'
            );
            return query.rows;
        } catch (error) {
            logger.error('Get subscription tiers error:', error);
            throw new Error('Failed to get subscription tiers');
        }
    }

    async getSubscriptionPlan(planId) {
        try {
            const query = await this.db.query(
                'SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true',
                [planId]
            );
            return query.rows[0] || null;
        } catch (error) {
            logger.error('Get subscription plan error:', error);
            throw new Error('Failed to get subscription plan');
        }
    }

    // User Subscription Management
    async getUserSubscription(userId) {
        try {
            const query = await this.db.query(
                `SELECT us.*, sp.name as plan_name, sp.price, sp.billing_cycle, st.name as tier_name
                 FROM user_subscriptions us
                 JOIN subscription_plans sp ON us.plan_id = sp.id
                 JOIN subscription_tiers st ON sp.tier_id = st.id
                 WHERE us.user_id = $1 AND us.status = 'active'
                 ORDER BY us.created_at DESC
                 LIMIT 1`,
                [userId]
            );
            return query.rows[0] || null;
        } catch (error) {
            logger.error('Get user subscription error:', error);
            throw new Error('Failed to get user subscription');
        }
    }

    async createUserSubscription(userId, planId, paymentMethodId = null) {
        try {
            // Get plan details
            const planQuery = await this.db.query(
                'SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true',
                [planId]
            );
            
            if (planQuery.rows.length === 0) {
                throw new Error('Subscription plan not found');
            }
            
            const plan = planQuery.rows[0];
            
            // Calculate billing period
            const now = new Date();
            const currentPeriodEnd = new Date();
            
            if (plan.billing_cycle === 'monthly') {
                currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
            } else {
                currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
            }
            
            // Create subscription
            const subscription = await this.db.query(
                `INSERT INTO user_subscriptions 
                 (user_id, plan_id, status, current_period_start, current_period_end)
                 VALUES ($1, $2, 'active', $3, $4)
                 RETURNING *`,
                [userId, planId, now, currentPeriodEnd]
            );
            
            // Record payment transaction (if payment method provided)
            if (paymentMethodId) {
                await this.recordPaymentTransaction(userId, subscription.rows[0].id, plan.price, 'subscription_creation');
            }
            
            // Initialize usage tracking
            await this.initializeUsageTracking(userId);
            
            logger.info('User subscription created', { userId, planId });
            return subscription.rows[0];
        } catch (error) {
            logger.error('Create user subscription error:', error);
            throw new Error('Failed to create user subscription');
        }
    }

    async cancelUserSubscription(userId, subscriptionId) {
        try {
            const subscription = await this.db.query(
                'SELECT * FROM user_subscriptions WHERE id = $1 AND user_id = $2',
                [subscriptionId, userId]
            );
            
            if (subscription.rows.length === 0) {
                throw new Error('Subscription not found');
            }
            
            await this.db.query(
                'UPDATE user_subscriptions SET cancel_at_period_end = true WHERE id = $1',
                [subscriptionId]
            );
            
            logger.info('User subscription canceled', { userId, subscriptionId });
            return { success: true };
        } catch (error) {
            logger.error('Cancel user subscription error:', error);
            throw new Error('Failed to cancel user subscription');
        }
    }

    async changeSubscriptionPlan(userId, newPlanId) {
        try {
            // Get current subscription
            const currentSubscription = await this.getUserSubscription(userId);
            if (!currentSubscription) {
                throw new Error('No active subscription found');
            }
            
            // Get new plan details
            const newPlanQuery = await this.db.query(
                'SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true',
                [newPlanId]
            );
            
            if (newPlanQuery.rows.length === 0) {
                throw new Error('New subscription plan not found');
            }
            
            const newPlan = newPlanQuery.rows[0];
            
            // Calculate proration if needed
            const priceDifference = this.calculatePriceDifference(currentSubscription, newPlan);
            
            // Update subscription
            const updatedSubscription = await this.db.query(
                `UPDATE user_subscriptions 
                 SET plan_id = $1, 
                     current_period_start = CURRENT_TIMESTAMP,
                     current_period_end = CASE 
                         WHEN $2 = 'monthly' THEN CURRENT_TIMESTAMP + INTERVAL '1 month'
                         ELSE CURRENT_TIMESTAMP + INTERVAL '1 year'
                     END
                 WHERE user_id = $3 AND status = 'active'
                 RETURNING *`,
                [newPlanId, newPlan.billing_cycle, userId]
            );
            
            // Record price difference as transaction
            if (priceDifference !== 0) {
                await this.recordPaymentTransaction(userId, updatedSubscription.rows[0].id, Math.abs(priceDifference), 'plan_change');
            }
            
            logger.info('Subscription plan changed', { userId, newPlanId });
            return updatedSubscription.rows[0];
        } catch (error) {
            logger.error('Change subscription plan error:', error);
            throw new Error('Failed to change subscription plan');
        }
    }

    // Payment Management
    async addPaymentMethod(userId, paymentMethodData) {
        try {
            // Check if this is the default payment method
            const isDefault = paymentMethodData.is_default || false;
            
            if (isDefault) {
                // Remove default status from other payment methods
                await this.db.query(
                    'UPDATE payment_methods SET is_default = false WHERE user_id = $1',
                    [userId]
                );
            }
            
            const paymentMethod = await this.db.query(
                `INSERT INTO payment_methods 
                 (user_id, provider, provider_payment_method_id, is_default, last_four_digits, 
                  expiry_month, expiry_year, card_type)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [
                    userId,
                    paymentMethodData.provider,
                    paymentMethodData.provider_payment_method_id,
                    isDefault,
                    paymentMethodData.last_four_digits,
                    paymentMethodData.expiry_month,
                    paymentMethodData.expiry_year,
                    paymentMethodData.card_type
                ]
            );
            
            logger.info('Payment method added', { userId, paymentMethodId: paymentMethod.rows[0].id });
            return paymentMethod.rows[0];
        } catch (error) {
            logger.error('Add payment method error:', error);
            throw new Error('Failed to add payment method');
        }
    }

    async getPaymentMethods(userId) {
        try {
            const query = await this.db.query(
                'SELECT * FROM payment_methods WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
                [userId]
            );
            return query.rows;
        } catch (error) {
            logger.error('Get payment methods error:', error);
            throw new Error('Failed to get payment methods');
        }
    }

    async recordPaymentTransaction(userId, subscriptionId, amount, description, provider = 'stripe') {
        try {
            const transaction = await this.db.query(
                `INSERT INTO payment_transactions 
                 (user_id, subscription_id, amount, status, provider, description)
                 VALUES ($1, $2, $3, 'succeeded', $4, $5)
                 RETURNING *`,
                [userId, subscriptionId, amount, provider, description]
            );
            
            logger.info('Payment transaction recorded', { userId, subscriptionId, amount });
            return transaction.rows[0];
        } catch (error) {
            logger.error('Record payment transaction error:', error);
            throw new Error('Failed to record payment transaction');
        }
    }

    // Usage Tracking
    async initializeUsageTracking(userId) {
        try {
            const tiers = ['ai_generations', 'track_uploads', 'prompt_refinements', 'storage_usage'];
            const now = new Date();
            const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of month
            
            for (const tier of tiers) {
                await this.db.query(
                    `INSERT INTO usage_tracking 
                     (user_id, metric_type, metric_value, period_start, period_end)
                     VALUES ($1, $2, 0, $3, $4)
                     ON CONFLICT (user_id, metric_type, period_start) 
                     DO NOTHING`,
                    [userId, tier, now, periodEnd]
                );
            }
        } catch (error) {
            logger.error('Initialize usage tracking error:', error);
            // Don't throw error as this is not critical
        }
    }

    async incrementUsage(userId, metricType, increment = 1) {
        try {
            const now = new Date();
            const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            
            await this.db.query(
                `UPDATE usage_tracking 
                 SET metric_value = metric_value + $1, 
                     updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $2 
                     AND metric_type = $3 
                     AND period_start = $4
                     AND period_end = $5`,
                [increment, userId, metricType, periodStart, periodEnd]
            );
        } catch (error) {
            logger.error('Increment usage error:', error);
            throw new Error('Failed to increment usage');
        }
    }

    async getUserUsage(userId, metricType = null) {
        try {
            const now = new Date();
            const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            
            let query;
            if (metricType) {
                query = await this.db.query(
                    'SELECT metric_value FROM usage_tracking WHERE user_id = $1 AND metric_type = $2 AND period_start = $3 AND period_end = $4',
                    [userId, metricType, periodStart, periodEnd]
                );
            } else {
                query = await this.db.query(
                    'SELECT metric_type, metric_value FROM usage_tracking WHERE user_id = $1 AND period_start = $2 AND period_end = $3',
                    [userId, periodStart, periodEnd]
                );
            }
            
            return metricType ? query.rows[0]?.metric_value || 0 : query.rows;
        } catch (error) {
            logger.error('Get user usage error:', error);
            throw new Error('Failed to get user usage');
        }
    }

    // Helper methods
    calculatePriceDifference(currentSubscription, newPlan) {
        // This is a simplified calculation - in production, you'd need to consider
        // proration, billing cycles, and remaining periods
        const currentPrice = parseFloat(currentSubscription.price);
        const newPrice = parseFloat(newPlan.price);
        
        // Simple difference calculation
        return newPrice - currentPrice;
    }

    // Check if user has reached usage limit
    async checkUsageLimit(userId, metricType) {
        try {
            const subscription = await this.getUserSubscription(userId);
            if (!subscription) {
                return { hasLimit: false, limit: 0, used: 0 };
            }
            
            const features = subscription.features || {};
            const limit = features[`${metricType}_monthly`] || 0;
            const used = await this.getUserUsage(userId, metricType);
            
            return {
                hasLimit: limit > 0,
                limit,
                used,
                remaining: Math.max(0, limit - used)
            };
        } catch (error) {
            logger.error('Check usage limit error:', error);
            throw new Error('Failed to check usage limit');
        }
    }

    // Get subscription status for user
    async getSubscriptionStatus(userId) {
        try {
            const subscription = await this.getUserSubscription(userId);
            if (!subscription) {
                return { status: 'none', tier: 'free' };
            }
            
            const now = new Date();
            const isTrial = subscription.trial_end && subscription.trial_end > now;
            const isCanceled = subscription.cancel_at_period_end;
            
            return {
                status: subscription.status,
                tier: subscription.tier_name,
                isTrial,
                isCanceled,
                currentPeriodEnd: subscription.current_period_end,
                features: subscription.features
            };
        } catch (error) {
            logger.error('Get subscription status error:', error);
            throw new Error('Failed to get subscription status');
        }
    }
}

module.exports = new SubscriptionService();