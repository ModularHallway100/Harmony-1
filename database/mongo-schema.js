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

// AI Artist Data Schema
const aiArtistSchema = new mongoose.Schema({
    artistId: {
        type: String,
        required: true,
        unique: true,
        ref: 'artists'
    },
    persona: {
        name: {
            type: String,
            required: true
        },
        personalityTraits: [{
            type: String,
            lowercase: true
        }],
        backstory: {
            type: String,
            maxlength: 2000
        },
        speakingStyle: {
            type: String,
            enum: ['formal', 'casual', 'energetic', 'mysterious', 'friendly'],
            default: 'casual'
        },
        visualStyle: {
            type: String,
            enum: [
                'futuristic', 'retro', 'minimalist', 'vibrant', 'dark',
                'cyberpunk', 'neon', 'watercolor', 'abstract', 'geometric',
                'surreal', 'pop-art', 'anime', 'realistic', 'cartoon', 'sketch'
            ],
            default: 'vibrant'
        },
        influences: [{
            type: String,
            maxlength: 100
        }],
        uniqueElements: [{
            type: String,
            maxlength: 100
        }]
    },
    musicStyle: {
        primaryGenres: [{
            type: String,
            lowercase: true
        }],
        subgenres: [{
            type: String,
            lowercase: true
        }],
        characteristics: [{
            type: String,
            lowercase: true
        }],
        mood: [{
            type: String,
            enum: ['happy', 'sad', 'energetic', 'calm', 'romantic', 'mysterious', 'epic', 'dramatic']
        }],
        tempo: [{
            type: String,
            enum: ['slow', 'medium', 'fast']
        }]
    },
    generationParameters: {
        modelVersion: {
            type: String,
            default: '1.0'
        },
        creativityLevel: {
            type: Number,
            min: 0,
            max: 100,
            default: 70
        },
        complexity: {
            type: Number,
            min: 0,
            max: 100,
            default: 50
        },
        consistency: {
            type: Number,
            min: 0,
            max: 100,
            default: 80
        },
        aiService: {
            type: String,
            enum: ['gemini', 'nano-banana', 'seedance'],
            default: 'gemini'
        }
    },
    performanceMetrics: {
        engagementRate: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        fanGrowth: {
            type: Number,
            default: 0
        },
        streams: {
            type: Number,
            default: 0
        },
        likes: {
            type: Number,
            default: 0
        },
        shares: {
            type: Number,
            default: 0
        },
        trackPopularity: {
            type: Map,
            of: Number
        },
        userFeedback: [{
            userId: String,
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            comment: String,
            timestamp: Date
        }]
    },
    aiTrainingData: {
        prompts: [{
            type: String,
            maxlength: 1000
        }],
        examples: [{
            type: String,
            maxlength: 1000
        }],
        fineTuningData: [{
            type: String,
            maxlength: 1000
        }]
    },
    imageGallery: [{
        imageId: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        prompt: {
            type: String,
            maxlength: 500
        },
        model: {
            type: String,
            enum: ['nano-banana', 'seedance', 'dall-e', 'midjourney']
        },
        isPrimary: {
            type: Boolean,
            default: false
        },
        tags: [{
            type: String,
            lowercase: true
        }],
        generatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    generationHistory: [{
        generationId: {
            type: String,
            required: true
        },
        generationType: {
            type: String,
            enum: ['artist', 'bio', 'image', 'track'],
            required: true
        },
        prompt: {
            type: String,
            required: true
        },
        refinedPrompt: {
            type: String
        },
        parameters: {
            type: Map,
            of: mongoose.Schema.Types.Mixed
        },
        result: {
            type: Map,
            of: mongoose.Schema.Types.Mixed
        },
        serviceUsed: {
            type: String,
            enum: ['gemini', 'nano-banana', 'seedance'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending'
        },
        errorMessage: {
            type: String
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        completedAt: {
            type: Date
        }
    }],
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

// Create text indexes for search functionality
aiArtistSchema.index({
    'persona.name': 'text',
    'persona.personalityTraits': 'text',
    'musicStyle.primaryGenres': 'text',
    'musicStyle.subgenres': 'text',
    'persona.visualStyle': 'text'
}, {
    weights: {
        'persona.name': 10,
        'persona.personalityTraits': 5,
        'musicStyle.primaryGenres': 8,
        'musicStyle.subgenres': 6,
        'persona.visualStyle': 3
    }
});

// Create compound indexes for performance
aiArtistSchema.index({ 'artistId': 1 });
aiArtistSchema.index({ 'persona.visualStyle': 1 });
aiArtistSchema.index({ 'persona.speakingStyle': 1 });
aiArtistSchema.index({ 'performanceMetrics.engagementRate': -1 });
aiArtistSchema.index({ 'performanceMetrics.streams': -1 });
aiArtistSchema.index({ 'createdAt': -1 });

// AI Generation History Schema (standalone for system-wide tracking)
const aiGenerationHistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'users'
    },
    artistId: {
        type: String,
        ref: 'artists'
    },
    generationType: {
        type: String,
        enum: ['artist', 'bio', 'image', 'track', 'playlist', 'prompt'],
        required: true
    },
    prompt: {
        type: String,
        required: true,
        maxlength: 2000
    },
    refinedPrompt: {
        type: String,
        maxlength: 2000
    },
    parameters: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    result: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    externalService: {
        type: String,
        enum: ['suno', 'udio', 'nano-banana', 'seedance', 'gemini', 'dall-e', 'midjourney'],
        required: true
    },
    serviceId: {
        type: String
    },
    errorMessage: {
        type: String,
        maxlength: 1000
    },
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            maxlength: 500
        },
        helpful: {
            type: Boolean
        }
    },
    processingTime: {
        type: Number, // in milliseconds
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Create indexes for AI Generation History
aiGenerationHistorySchema.index({ 'userId': 1, 'createdAt': -1 });
aiGenerationHistorySchema.index({ 'artistId': 1, 'createdAt': -1 });
aiGenerationHistorySchema.index({ 'generationType': 1, 'status': 1 });
aiGenerationHistorySchema.index({ 'externalService': 1, 'status': 1 });
aiGenerationHistorySchema.index({ 'createdAt': -1 });

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
const AIArtist = mongoose.model('AIArtist', aiArtistSchema);
const AIGenerationHistory = mongoose.model('AIGenerationHistory', aiGenerationHistorySchema);
const UserActivity = mongoose.model('UserActivity', userActivitySchema);
const ContentRecommendations = mongoose.model('ContentRecommendations', contentRecommendationsSchema);
const TrendingContent = mongoose.model('TrendingContent', trendingContentSchema);

module.exports = {
    UserPreferences,
    AIArtist,
    AIGenerationHistory,
    UserActivity,
    ContentRecommendations,
    TrendingContent
};