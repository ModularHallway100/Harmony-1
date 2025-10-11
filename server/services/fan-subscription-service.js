const { postgresConnection } = require('../config/postgres');
const logger = require('../utils/logger');

class FanSubscriptionService {
    constructor() {
        this.db = postgresConnection;
    }

    // Get available fan subscription tiers for an artist
    async getArtistSubscriptionTiers(artistId) {
        try {
            const query = await this.db.query(
                `SELECT DISTINCT st.*, fs.price as fan_price, fs.platform_percentage
                 FROM subscription_tiers st
                 LEFT JOIN fan_subscriptions fs ON st.name = fs.tier_id AND fs.artist_id = $1 AND fs.status = 'active'
                 WHERE st.is_active = true
                 ORDER BY st.price ASC`,
                [artistId]
            );
            
            return query.rows;
        } catch (error) {
            logger.error('Get artist subscription tiers error:', error);
            throw new Error('Failed to get artist subscription tiers');
        }
    }

    // Create a fan subscription
    async createFanSubscription(fanId, artistId, tierId, price = null, platformPercentage = 0.20) {
        try {
            // Check if artist is a creator (has fan subscription enabled)
            const artistQuery = await this.db.query(
                'SELECT * FROM artists WHERE id = $1 AND user_id IS NOT NULL',
                [artistId]
            );
            
            if (artistQuery.rows.length === 0) {
                throw new Error('Artist not found or not a creator');
            }
            
            // Check if fan already has an active subscription to this artist
            const existingSubscription = await this.db.query(
                'SELECT * FROM fan_subscriptions WHERE fan_id = $1 AND artist_id = $2 AND status = \'active\'',
                [fanId, artistId]
            );
            
            if (existingSubscription.rows.length > 0) {
                throw new Error('Fan already has an active subscription to this artist');
            }
            
            // Get tier details
            const tierQuery = await this.db.query(
                'SELECT * FROM subscription_tiers WHERE name = $1 AND is_active = true',
                [tierId]
            );
            
            if (tierQuery.rows.length === 0) {
                throw new Error('Subscription tier not found');
            }
            
            const tier = tierQuery.rows[0];
            
            // Calculate price (use provided price or tier price)
            const subscriptionPrice = price || parseFloat(tier.price);
            
            // Calculate billing period (monthly for fan subscriptions)
            const now = new Date();
            const currentPeriodEnd = new Date(now);
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
            
            // Create fan subscription
            const subscription = await this.db.query(
                `INSERT INTO fan_subscriptions 
                 (fan_id, artist_id, tier_id, status, current_period_start, current_period_end, price, platform_percentage)
                 VALUES ($1, $2, $3, 'active', $4, $5, $6, $7)
                 RETURNING *`,
                [fanId, artistId, tierId, now, currentPeriodEnd, subscriptionPrice, platformPercentage]
            );
            
            // Create benefits for this subscription
            await this.createFanSubscriptionBenefits(subscription.rows[0].id, tierId);
            
            // Record revenue for the artist
            await this.recordCreatorRevenue(artistId, subscription.rows[0].id, subscriptionPrice * (1 - platformPercentage));
            
            logger.info('Fan subscription created', { fanId, artistId, tierId });
            return subscription.rows[0];
        } catch (error) {
            logger.error('Create fan subscription error:', error);
            throw new Error('Failed to create fan subscription');
        }
    }

    // Cancel a fan subscription
    async cancelFanSubscription(fanId, subscriptionId) {
        try {
            // Check if subscription exists and belongs to fan
            const subscription = await this.db.query(
                'SELECT * FROM fan_subscriptions WHERE id = $1 AND fan_id = $2',
                [subscriptionId, fanId]
            );
            
            if (subscription.rows.length === 0) {
                throw new Error('Subscription not found');
            }
            
            await this.db.query(
                'UPDATE fan_subscriptions SET status = \'canceled\' WHERE id = $1',
                [subscriptionId]
            );
            
            logger.info('Fan subscription canceled', { fanId, subscriptionId });
            return { success: true };
        } catch (error) {
            logger.error('Cancel fan subscription error:', error);
            throw new Error('Failed to cancel fan subscription');
        }
    }

    // Get fan's subscriptions
    async getFanSubscriptions(fanId) {
        try {
            const query = await this.db.query(
                `SELECT fs.*, a.name as artist_name, a.profile_image_url, st.name as tier_name, st.description as tier_description
                 FROM fan_subscriptions fs
                 JOIN artists a ON fs.artist_id = a.id
                 JOIN subscription_tiers st ON fs.tier_id = st.name
                 WHERE fs.fan_id = $1 AND fs.status = 'active'
                 ORDER BY fs.created_at DESC`,
                [fanId]
            );
            
            return query.rows;
        } catch (error) {
            logger.error('Get fan subscriptions error:', error);
            throw new Error('Failed to get fan subscriptions');
        }
    }

    // Get artist's subscribers
    async getArtistSubscribers(artistId, page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            
            const query = await this.db.query(
                `SELECT fs.*, u.username, u.avatar_url, u.full_name, st.name as tier_name, fs.price as subscription_price
                 FROM fan_subscriptions fs
                 JOIN users u ON fs.fan_id = u.id
                 JOIN subscription_tiers st ON fs.tier_id = st.name
                 WHERE fs.artist_id = $1 AND fs.status = 'active'
                 ORDER BY fs.created_at DESC
                 LIMIT $2 OFFSET $3`,
                [artistId, limit, offset]
            );
            
            // Get total count for pagination
            const countQuery = await this.db.query(
                'SELECT COUNT(*) FROM fan_subscriptions WHERE artist_id = $1 AND status = \'active\'',
                [artistId]
            );
            
            const total = parseInt(countQuery.rows[0].count);
            const totalPages = Math.ceil(total / limit);
            
            return {
                subscribers: query.rows,
                pagination: {
                    current: page,
                    total: totalPages,
                    count: total
                }
            };
        } catch (error) {
            logger.error('Get artist subscribers error:', error);
            throw new Error('Failed to get artist subscribers');
        }
    }

    // Get artist's revenue
    async getArtistRevenue(artistId, period = 'monthly') {
        try {
            const now = new Date();
            let periodStart;
            
            switch (period) {
                case 'daily':
                    periodStart = new Date(now);
                    periodStart.setDate(periodStart.getDate() - 1);
                    break;
                case 'weekly':
                    periodStart = new Date(now);
                    periodStart.setDate(periodStart.getDate() - 7);
                    break;
                case 'monthly':
                    periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    break;
                case 'yearly':
                    periodStart = new Date(now.getFullYear() - 1, 0, 1);
                    break;
                default:
                    periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            }
            
            const query = await this.db.query(
                `SELECT 
                    SUM(amount) as total_revenue,
                    COUNT(*) as subscription_count,
                    AVG(amount) as average_subscription,
                    status,
                    period_start,
                    period_end
                 FROM creator_revenue 
                 WHERE artist_id = $1 AND period_start >= $2
                 GROUP BY status, period_start, period_end
                 ORDER BY period_start DESC`,
                [artistId, periodStart]
            );
            
            // Get total revenue across all periods
            const totalQuery = await this.db.query(
                `SELECT SUM(amount) as total FROM creator_revenue WHERE artist_id = $1`,
                [artistId]
            );
            
            const totalRevenue = parseFloat(totalQuery.rows[0].total) || 0;
            
            return {
                revenue_by_period: query.rows,
                total_revenue: totalRevenue,
                period: period
            };
        } catch (error) {
            logger.error('Get artist revenue error:', error);
            throw new Error('Failed to get artist revenue');
        }
    }

    // Create fan subscription benefits
    async createFanSubscriptionBenefits(subscriptionId, tierId) {
        try {
            // Get tier features
            const tierQuery = await this.db.query(
                'SELECT features FROM subscription_tiers WHERE name = $1',
                [tierId]
            );
            
            if (tierQuery.rows.length === 0) {
                throw new Error('Tier not found');
            }
            
            const features = tierQuery.rows[0].features || {};
            const benefits = [];
            
            // Create benefits based on tier features
            if (features.exclusive_content) {
                benefits.push({
                    benefit_type: 'exclusive_content',
                    benefit_data: { access_granted: true }
                });
            }
            
            if (features.early_access) {
                benefits.push({
                    benefit_type: 'early_access',
                    benefit_data: { early_access: true }
                });
            }
            
            if (features.custom_tracks) {
                benefits.push({
                    benefit_type: 'custom_tracks',
                    benefit_data: { custom_track_requests: 5 } // Example: 5 custom tracks per month
                });
            }
            
            // Insert benefits
            for (const benefit of benefits) {
                await this.db.query(
                    `INSERT INTO fan_subscription_benefits 
                     (fan_subscription_id, benefit_type, benefit_data)
                     VALUES ($1, $2, $3)`,
                    [subscriptionId, benefit.benefit_type, JSON.stringify(benefit.benefit_data)]
                );
            }
            
            logger.info('Fan subscription benefits created', { subscriptionId, tierId });
        } catch (error) {
            logger.error('Create fan subscription benefits error:', error);
            throw new Error('Failed to create fan subscription benefits');
        }
    }

    // Record creator revenue
    async recordCreatorRevenue(artistId, fanSubscriptionId, amount) {
        try {
            const now = new Date();
            const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            
            await this.db.query(
                `INSERT INTO creator_revenue 
                 (artist_id, fan_subscription_id, amount, period_start, period_end, status)
                 VALUES ($1, $2, $3, $4, $5, 'pending')`,
                [artistId, fanSubscriptionId, amount, periodStart, periodEnd]
            );
            
            logger.info('Creator revenue recorded', { artistId, amount });
        } catch (error) {
            logger.error('Record creator revenue error:', error);
            throw new Error('Failed to record creator revenue');
        }
    }

    // Get fan subscription benefits
    async getFanSubscriptionBenefits(subscriptionId) {
        try {
            const query = await this.db.query(
                `SELECT * FROM fan_subscription_benefits 
                 WHERE fan_subscription_id = $1`,
                [subscriptionId]
            );
            
            return query.rows;
        } catch (error) {
            logger.error('Get fan subscription benefits error:', error);
            throw new Error('Failed to get fan subscription benefits');
        }
    }

    // Claim a fan subscription benefit
    async claimFanSubscriptionBenefit(subscriptionId, benefitId) {
        try {
            const benefit = await this.db.query(
                `SELECT * FROM fan_subscription_benefits 
                 WHERE id = $1 AND fan_subscription_id = $2`,
                [benefId, subscriptionId]
            );
            
            if (benefit.rows.length === 0) {
                throw new Error('Benefit not found');
            }
            
            if (benefit.rows[0].claimed) {
                throw new Error('Benefit already claimed');
            }
            
            await this.db.query(
                `UPDATE fan_subscription_benefits 
                 SET claimed = true, claimed_at = CURRENT_TIMESTAMP 
                 WHERE id = $1`,
                [benefitId]
            );
            
            logger.info('Fan subscription benefit claimed', { subscriptionId, benefitId });
            return { success: true };
        } catch (error) {
            logger.error('Claim fan subscription benefit error:', error);
            throw new Error('Failed to claim fan subscription benefit');
        }
    }

    // Get exclusive content for a fan
    async getFanExclusiveContent(fanId) {
        try {
            // Get fan's active subscriptions
            const subscriptions = await this.getFanSubscriptions(fanId);
            
            if (subscriptions.length === 0) {
                return [];
            }
            
            // Get all exclusive content from subscribed artists
            const artistIds = subscriptions.map(sub => sub.artist_id);
            
            const query = await this.db.query(
                `SELECT ec.*, a.name as artist_name, a.profile_image_url
                 FROM exclusive_content ec
                 JOIN artists a ON ec.artist_id = a.id
                 WHERE ec.artist_id = ANY($1) 
                     AND ec.is_public = false
                     AND ec.fan_subscription_required = true
                 ORDER BY ec.created_at DESC`,
                [artistIds]
            );
            
            return query.rows;
        } catch (error) {
            logger.error('Get fan exclusive content error:', error);
            throw new Error('Failed to get fan exclusive content');
        }
    }

    // Create exclusive content for an artist
    async createExclusiveContent(artistId, contentData) {
        try {
            // Check if artist is a creator
            const artistQuery = await this.db.query(
                'SELECT * FROM artists WHERE id = $1 AND user_id IS NOT NULL',
                [artistId]
            );
            
            if (artistQuery.rows.length === 0) {
                throw new Error('Artist not found or not a creator');
            }
            
            const content = await this.db.query(
                `INSERT INTO exclusive_content 
                 (artist_id, title, description, content_type, content_url, content_data, 
                  is_public, subscription_tier_required, fan_subscription_required)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING *`,
                [
                    artistId,
                    contentData.title,
                    contentData.description,
                    contentData.content_type,
                    contentData.content_url,
                    JSON.stringify(contentData.content_data || {}),
                    contentData.is_public || false,
                    contentData.subscription_tier_required,
                    contentData.fan_subscription_required || false
                ]
            );
            
            logger.info('Exclusive content created', { artistId, contentId: content.rows[0].id });
            return content.rows[0];
        } catch (error) {
            logger.error('Create exclusive content error:', error);
            throw new Error('Failed to create exclusive content');
        }
    }

    // Get artist's exclusive content
    async getArtistExclusiveContent(artistId, page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            
            const query = await this.db.query(
                `SELECT * FROM exclusive_content 
                 WHERE artist_id = $1 
                 ORDER BY created_at DESC
                 LIMIT $2 OFFSET $3`,
                [artistId, limit, offset]
            );
            
            // Get total count for pagination
            const countQuery = await this.db.query(
                'SELECT COUNT(*) FROM exclusive_content WHERE artist_id = $1',
                [artistId]
            );
            
            const total = parseInt(countQuery.rows[0].count);
            const totalPages = Math.ceil(total / limit);
            
            return {
                content: query.rows,
                pagination: {
                    current: page,
                    total: totalPages,
                    count: total
                }
            };
        } catch (error) {
            logger.error('Get artist exclusive content error:', error);
            throw new Error('Failed to get artist exclusive content');
        }
    }
}

module.exports = new FanSubscriptionService();