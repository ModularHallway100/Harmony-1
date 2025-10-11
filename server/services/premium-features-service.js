const { postgresConnection } = require('../config/postgres');
const logger = require('../utils/logger');

class PremiumFeaturesService {
    constructor() {
        this.db = postgresConnection;
    }

    // Check if user has access to premium features
    async checkPremiumAccess(userId) {
        try {
            const subscriptionQuery = await this.db.query(
                `SELECT us.*, st.name as tier_name, st.features
                 FROM user_subscriptions us
                 JOIN subscription_plans sp ON us.plan_id = sp.id
                 JOIN subscription_tiers st ON sp.tier_id = st.id
                 WHERE us.user_id = $1 AND us.status = 'active'
                 ORDER BY us.created_at DESC
                 LIMIT 1`,
                [userId]
            );

            if (subscriptionQuery.rows.length === 0) {
                return {
                    hasAccess: false,
                    tier: 'free',
                    features: {}
                };
            }

            const subscription = subscriptionQuery.rows[0];
            const features = subscription.features || {};

            return {
                hasAccess: subscription.tier_name !== 'free',
                tier: subscription.tier_name,
                features,
                subscriptionId: subscription.id
            };
        } catch (error) {
            logger.error('Check premium access error:', error);
            throw new Error('Failed to check premium access');
        }
    }

    // Get AI generation priority queue status
    async getAIGenerationPriority(userId) {
        try {
            const access = await this.checkPremiumAccess(userId);
            
            if (!access.hasAccess) {
                return {
                    hasPriority: false,
                    position: null,
                    estimatedWaitTime: null,
                    message: 'Priority generation requires a premium subscription'
                };
            }

            // In a real implementation, you would check a priority queue system
            // For now, we'll simulate the response
            return {
                hasPriority: true,
                position: 1, // Simulated position in queue
                estimatedWaitTime: '2-5 minutes', // Simulated wait time
                message: 'Your request has been added to the priority queue'
            };
        } catch (error) {
            logger.error('Get AI generation priority error:', error);
            throw new Error('Failed to get AI generation priority');
        }
    }

    // Process AI generation with priority
    async processAIGenerationWithPriority(userId, promptData) {
        try {
            const access = await this.checkPremiumAccess(userId);
            
            if (!access.hasAccess) {
                throw new Error('Priority generation requires a premium subscription');
            }

            // Add to priority queue
            // In a real implementation, this would involve a job queue system
            const priorityRequest = {
                userId,
                promptData,
                priority: true,
                timestamp: new Date(),
                status: 'queued'
            };

            logger.info('Priority AI generation request', { userId, promptData });

            // Simulate processing
            setTimeout(() => {
                logger.info('Priority AI generation completed', { userId });
            }, 30000); // 30 seconds delay

            return {
                success: true,
                message: 'Your priority generation request has been queued',
                requestId: `priority-${Date.now()}`,
                estimatedCompletion: '30-60 seconds'
            };
        } catch (error) {
            logger.error('Process AI generation with priority error:', error);
            throw new Error('Failed to process priority AI generation');
        }
    }

    // Get enhanced prompt rewriting options
    async getEnhancedPromptRewriting(userId, basePrompt) {
        try {
            const access = await this.checkPremiumAccess(userId);
            
            if (!access.hasAccess) {
                return {
                    hasAccess: false,
                    options: [],
                    message: 'Enhanced prompt rewriting requires a premium subscription'
                };
            }

            // Simulate enhanced prompt options
            const enhancedOptions = [
                {
                    id: 'enhanced-1',
                    title: 'Professional Music Producer',
                    description: 'Transform your prompt with professional music production terminology',
                    enhancedPrompt: `Professional music production prompt: ${basePrompt}. Focus on studio-quality sound, professional mixing techniques, and industry-standard production elements.`,
                    tags: ['professional', 'studio-quality', 'industry-standard']
                },
                {
                    id: 'enhanced-2',
                    title: 'Genre-Specific Enhancement',
                    description: 'Add genre-specific details and terminology to your prompt',
                    enhancedPrompt: `Genre-specific music prompt: ${basePrompt}. Incorporate authentic ${basePrompt.includes('rock') ? 'rock' : basePrompt.includes('jazz') ? 'jazz' : 'electronic'} music elements, subgenre characteristics, and stylistic conventions.`,
                    tags: ['genre-specific', 'authentic', 'stylistic']
                },
                {
                    id: 'enhanced-3',
                    title: 'Emotional Depth Enhancement',
                    description: 'Add emotional depth and psychological elements to your prompt',
                    enhancedPrompt: `Emotionally resonant music prompt: ${basePrompt}. Infuse with profound emotional depth, psychological undertones, and evocative musical expression that creates a powerful connection with the listener.`,
                    tags: ['emotional', 'psychological', 'evocative']
                },
                {
                    id: 'enhanced-4',
                    title: 'Technical Specification Enhancement',
                    description: 'Add technical specifications and production details',
                    enhancedPrompt: `Technically detailed music prompt: ${basePrompt}. Include specific production elements: BPM range, key signature, chord progressions, instrumentation details, mixing approach, and mastering specifications for optimal audio quality.`,
                    tags: ['technical', 'detailed', 'specifications']
                }
            ];

            return {
                hasAccess: true,
                options: enhancedOptions,
                usedCount: access.features.enhanced_prompt_tools_used || 0,
                remainingCount: 1000 - (access.features.enhanced_prompt_tools_used || 0) // Creator tier limit
            };
        } catch (error) {
            logger.error('Get enhanced prompt rewriting error:', error);
            throw new Error('Failed to get enhanced prompt rewriting options');
        }
    }

    // Get analytics dashboard data
    async getAnalyticsDashboard(userId) {
        try {
            const access = await this.checkPremiumAccess(userId);
            
            if (!access.hasAccess) {
                return {
                    hasAccess: false,
                    message: 'Analytics dashboard requires a premium subscription'
                };
            }

            // Get user's content performance data
            const contentQuery = await this.db.query(
                `SELECT 
                    COUNT(t.id) as total_tracks,
                    SUM(t.play_count) as total_plays,
                    SUM(t.like_count) as total_likes,
                    AVG(t.play_count) as avg_plays_per_track,
                    MAX(t.play_count) as max_plays
                 FROM tracks t
                 WHERE t.artist_id IN (
                     SELECT a.id FROM artists a WHERE a.user_id = $1
                 )`,
                [userId]
            );

            // Get user's engagement metrics
            const engagementQuery = await this.db.query(
                `SELECT 
                    COUNT(DISTINCT ul.user_id) as unique_listeners,
                    COUNT(DISTINCT uf.user_id) as unique_followers,
                    COUNT(DISTINCT c.id) as total_comments
                 FROM users u
                 LEFT JOIN user_likes ul ON u.id = ul.user_id
                 LEFT JOIN user_follows uf ON u.id = uf.artist_id
                 LEFT JOIN comments c ON u.id = c.artist_id
                 WHERE u.id = $1`,
                [userId]
            );

            // Get AI generation statistics
            const aiStatsQuery = await this.db.query(
                `SELECT 
                    COUNT(*) as total_generations,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_generations,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_generations,
                    AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/60) as avg_completion_minutes
                 FROM ai_generation_history
                 WHERE user_id = $1`,
                [userId]
            );

            // Get subscription revenue for creators
            let revenueData = {};
            if (access.tier === 'creator') {
                const revenueQuery = await this.db.query(
                    `SELECT 
                        SUM(amount) as total_revenue,
                        COUNT(*) as total_subscriptions,
                        AVG(amount) as avg_subscription_value
                     FROM creator_revenue
                     WHERE artist_id IN (
                         SELECT a.id FROM artists a WHERE a.user_id = $1
                     ) AND status = 'paid'`,
                    [userId]
                );

                revenueData = revenueQuery.rows[0] || {};
            }

            // Calculate growth metrics (last 30 days vs previous 30 days)
            const now = new Date();
            const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const previous30Days = new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000);

            const growthQuery = await this.db.query(
                `SELECT 
                    COUNT(CASE WHEN created_at >= $1 THEN 1 END) as recent_tracks,
                    COUNT(CASE WHEN created_at >= $1 AND created_at < $2 THEN 1 END) as previous_tracks
                 FROM tracks
                 WHERE artist_id IN (
                     SELECT a.id FROM artists a WHERE a.user_id = $3
                 )`,
                [last30Days, previous30Days, userId]
            );

            const recentTracks = parseInt(growthQuery.rows[0].recent_tracks) || 0;
            const previousTracks = parseInt(growthQuery.rows[0].previous_tracks) || 0;
            const trackGrowth = previousTracks > 0 ? 
                Math.round(((recentTracks - previousTracks) / previousTracks) * 100) : 0;

            return {
                hasAccess: true,
                contentPerformance: contentQuery.rows[0],
                engagementMetrics: engagementQuery.rows[0],
                aiGenerationStats: aiStatsQuery.rows[0],
                revenueData: revenueData,
                growthMetrics: {
                    trackGrowth: `${trackGrowth}%`,
                    recentTracks,
                    previousTracks
                },
                period: 'last_30_days'
            };
        } catch (error) {
            logger.error('Get analytics dashboard error:', error);
            throw new Error('Failed to get analytics dashboard');
        }
    }

    // Get early access features
    async getEarlyAccessFeatures(userId) {
        try {
            const access = await this.checkPremiumAccess(userId);
            
            if (!access.hasAccess) {
                return {
                    hasAccess: false,
                    features: [],
                    message: 'Early access features require a premium subscription'
                };
            }

            // Simulate early access features
            const earlyAccessFeatures = [
                {
                    id: 'beta-ai-model',
                    name: 'Beta AI Music Model',
                    description: 'Access to our next-generation AI music generation model',
                    status: 'available',
                    benefits: ['Higher quality output', 'More diverse styles', 'Faster generation'],
                    feedbackRequired: true
                },
                {
                    id: 'collaborative-tools',
                    name: 'Collaborative Creation Tools',
                    description: 'Work with other artists in real-time on music projects',
                    status: 'limited', // Limited availability
                    benefits: ['Real-time collaboration', 'Shared workspaces', 'Version control'],
                    feedbackRequired: true
                },
                {
                    id: 'advanced-mastering',
                    name: 'Advanced AI Mastering',
                    description: 'Professional-grade AI mastering for your tracks',
                    status: 'available',
                    benefits: ['Industry-standard quality', 'Multiple style options', 'Batch processing'],
                    feedbackRequired: false
                }
            ];

            return {
                hasAccess: true,
                features: earlyAccessFeatures,
                feedbackGiven: access.features.early_access_feedback_given || false
            };
        } catch (error) {
            logger.error('Get early access features error:', error);
            throw new Error('Failed to get early access features');
        }
    }

    // Submit feedback for early access features
    async submitEarlyAccessFeedback(userId, featureId, feedback) {
        try {
            const access = await this.checkPremiumAccess(userId);
            
            if (!access.hasAccess) {
                throw new Error('Early access feedback requires a premium subscription');
            }

            // Store feedback in database
            const feedbackQuery = await this.db.query(
                `INSERT INTO early_access_feedback 
                 (user_id, feature_id, rating, comments, suggestions)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [userId, featureId, feedback.rating, feedback.comments, feedback.suggestions]
            );

            // Mark that user has given feedback
            await this.db.query(
                `UPDATE subscription_plans 
                 SET features = jsonb_set(features, '{early_access_feedback_given}', 'true')
                 WHERE id = (
                     SELECT plan_id FROM user_subscriptions 
                     WHERE user_id = $1 AND status = 'active'
                     LIMIT 1
                 )`,
                [userId]
            );

            logger.info('Early access feedback submitted', { userId, featureId });

            return {
                success: true,
                message: 'Thank you for your feedback!',
                feedbackId: feedbackQuery.rows[0].id
            };
        } catch (error) {
            logger.error('Submit early access feedback error:', error);
            throw new Error('Failed to submit early access feedback');
        }
    }

    // Get custom track requests (for subscribers)
    async getCustomTrackRequests(userId) {
        try {
            const access = await this.checkPremiumAccess(userId);
            
            if (!access.hasAccess) {
                return {
                    hasAccess: false,
                    requests: [],
                    message: 'Custom track requests require a premium subscription'
                };
            }

            // Get fan subscription requests
            const requestsQuery = await this.db.query(
                `SELECT 
                    fsr.id, fsr.request_text, fsr.status, fsr.created_at,
                    u.username as fan_username, u.avatar_url as fan_avatar,
                    a.name as artist_name
                 FROM fan_subscription_requests fsr
                 JOIN users u ON fsr.fan_id = u.id
                 JOIN artists a ON fsr.artist_id = a.id
                 WHERE fsr.artist_id IN (
                     SELECT a.id FROM artists a WHERE a.user_id = $1
                 ) AND fsr.status = 'pending'
                 ORDER BY fsr.created_at DESC
                 LIMIT 10`,
                [userId]
            );

            return {
                hasAccess: true,
                requests: requestsQuery.rows,
                totalPending: requestsQuery.rows.length
            };
        } catch (error) {
            logger.error('Get custom track requests error:', error);
            throw new Error('Failed to get custom track requests');
        }
    }

    // Process custom track request
    async processCustomTrackRequest(userId, requestId, action, responseText = null) {
        try {
            const access = await this.checkPremiumAccess(userId);
            
            if (!access.hasAccess) {
                throw new Error('Processing custom track requests requires a premium subscription');
            }

            // Get the request
            const requestQuery = await this.db.query(
                'SELECT * FROM fan_subscription_requests WHERE id = $1 AND artist_id IN (SELECT a.id FROM artists a WHERE a.user_id = $2)',
                [requestId, userId]
            );

            if (requestQuery.rows.length === 0) {
                throw new Error('Request not found or unauthorized');
            }

            const request = requestQuery.rows[0];

            // Update request status
            await this.db.query(
                `UPDATE fan_subscription_requests 
                 SET status = $1, response_text = $2, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $3`,
                [action, responseText, requestId]
            );

            // If accepted, create a track generation job
            if (action === 'accepted') {
                await this.db.query(
                    `INSERT INTO track_generation_jobs 
                     (artist_id, fan_id, request_text, status, created_at)
                     VALUES ($1, $2, $3, 'queued', CURRENT_TIMESTAMP)`,
                    [request.artist_id, request.fan_id, request.request_text]
                );
            }

            logger.info('Custom track request processed', { 
                userId, 
                requestId, 
                action 
            });

            return {
                success: true,
                message: `Request ${action} successfully`,
                requestId
            };
        } catch (error) {
            logger.error('Process custom track request error:', error);
            throw new Error('Failed to process custom track request');
        }
    }
}

module.exports = new PremiumFeaturesService();