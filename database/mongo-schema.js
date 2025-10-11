// MongoDB Schema for Harmony Music Platform
// This file defines the MongoDB collections and their schemas for flexible data storage

const mongoose = require('mongoose');

// User Preferences Schema
const userPreferencesSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        ref: 'users'
    },
    musicPreferences: {
        favoriteGenres: [{
            type: String,
            lowercase: true
        }],
        favoriteArtists: [{
            type: String,
            lowercase: true
        }],
        preferredMoods: [{
            type: String,
            lowercase: true
        }],
        energyLevels: [{
            type: String,
            enum: ['low', 'medium', 'high']
        }],
        tempoPreferences: [{
            type: String,
            enum: ['slow', 'medium', 'fast']
        }]
    },
    playbackSettings: {
        quality: {
            type: String,
            enum: ['low', 'medium', 'high', 'lossless'],
            default: 'high'
        },
        crossfade: {
            type: Number,
            min: 0,
            max: 10,
            default: 0
        },
        normalizeVolume: {
            type: Boolean,
            default: true
        },
        repeatMode: {
            type: String,
            enum: ['off', 'track', 'playlist'],
            default: 'off'
        },
        shuffleMode: {
            type: String,
            enum: ['off', 'tracks', 'albums'],
            default: 'off'
        }
    },
    discoverySettings: {
        recommendSimilar: {
            type: Boolean,
            default: true
        },
        showNewReleases: {
            type: Boolean,
            default: true
        },
        personalizedMixes: {
            type: Boolean,
            default: true
        },
        diversityFactor: {
            type: Number,
            min: 0,
            max: 100,
            default: 50
        }
    },
    privacySettings: {
        profileVisibility: {
            type: String,
            enum: ['public', 'friends', 'private'],
            default: 'public'
        },
        activityVisibility: {
            type: String,
            enum: ['public', 'friends', 'private'],
            default: 'friends'
        },
        dataCollection: {
            type: Boolean,
            default: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// AI Artist Analytics Schema (for flexible, non-relational data)
const aiArtistAnalyticsSchema = new mongoose.Schema({
    artistId: { // Corresponds to the UUID in PostgreSQL
        type: String,
        required: true,
        unique: true,
        index: true
    },
    performanceMetrics: {
        engagementRate: { type: Number, default: 0 },
        fanGrowth: { type: Number, default: 0 },
        streams: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        trackPopularity: { type: Map, of: Number },
        userFeedback: [{
            userId: String,
            rating: { type: Number, min: 1, max: 5 },
            comment: String,
            timestamp: { type: Date, default: Date.now }
        }]
    },
    aiTrainingData: {
        prompts: [String],
        examples: [String],
        fineTuningData: [String]
    },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// AI Generation Log Schema (for tracking generation events)
const aiGenerationLogSchema = new mongoose.Schema({
    generationId: { // Corresponds to the UUID in PostgreSQL
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: { type: String, required: true, index: true },
    promptId: { type: String, index: true },
    artistId: { type: String, index: true },
    parameters: { type: Map, of: mongoose.Schema.Types.Mixed },
    result: { type: Map, of: mongoose.Schema.Types.Mixed },
    externalService: {
        type: String,
        enum: ['suno', 'udio', 'nano-banana', 'seedance', 'gemini', 'dall-e', 'midjourney']
    },
    serviceId: String,
    feedback: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String, maxlength: 500 },
        helpful: Boolean
    },
    processingTime: { type: Number, default: 0 }, // in milliseconds
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// User Activity Schema
const userActivitySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'users'
    },
    activityType: {
        type: String,
        enum: [
            'track_play', 'like', 'follow', 'playlist_create', 
            'playlist_add', 'comment', 'search', 'share',
            'ai_generation', 'prompt_refinement'
        ],
        required: true
    },
    entityId: {
        type: String
    },
    entityType: {
        type: String,
        enum: ['track', 'artist', 'playlist', 'comment', 'search']
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    sessionInfo: {
        sessionId: String,
        deviceType: String,
        platform: String,
        location: String
    }
}, {
    timestamps: false
});

// Content Recommendations Schema
const contentRecommendationsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'users'
    },
    recommendationType: {
        type: String,
        enum: ['tracks', 'artists', 'playlists', 'mixes'],
        required: true
    },
    recommendations: [{
        id: String,
        score: Number,
        reason: String,
        metadata: {
            type: Map,
            of: mongoose.Schema.Types.Mixed
        }
    }],
    algorithmVersion: {
        type: String,
        default: '1.0'
    },
    context: {
        timeOfDay: String,
        dayOfWeek: String,
        userActivity: String,
        season: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: function() {
            return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        }
    }
}, {
    timestamps: false
});

// Trending Content Schema
const trendingContentSchema = new mongoose.Schema({
    contentId: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        enum: ['track', 'artist', 'playlist'],
        required: true
    },
    trendScore: {
        type: Number,
        required: true
    },
    timeWindow: {
        type: String,
        enum: ['hour', 'day', 'week', 'month'],
        required: true
    },
    region: {
        type: String,
        default: 'global'
    },
    metrics: {
        plays: Number,
        likes: Number,
        shares: Number,
        newFollowers: Number,
        engagementRate: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: function() {
            const now = new Date();
            switch(this.timeWindow) {
                case 'hour': return new Date(now.getTime() + 60 * 60 * 1000);
                case 'day': return new Date(now.getTime() + 24 * 60 * 60 * 1000);
                case 'week': return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                case 'month': return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                default: return new Date(now.getTime() + 24 * 60 * 60 * 1000);
            }
        }
    }
}, {
    timestamps: false
});

// Create models
const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);
const AIArtistAnalytics = mongoose.model('AIArtistAnalytics', aiArtistAnalyticsSchema);
const AIGenerationLog = mongoose.model('AIGenerationLog', aiGenerationLogSchema);
const UserActivity = mongoose.model('UserActivity', userActivitySchema);
const ContentRecommendations = mongoose.model('ContentRecommendations', contentRecommendationsSchema);
const TrendingContent = mongoose.model('TrendingContent', trendingContentSchema);

module.exports = {
    UserPreferences,
    AIArtistAnalytics,
    AIGenerationLog,
    UserActivity,
    ContentRecommendations,
    TrendingContent
};