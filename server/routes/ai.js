const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth'); // Centralized auth
const aiService = require('../services/ai-service');
const { validate } = require('../middleware/validation');
const { body, query } = require('express-validator');

// Rate limiting middleware
const rateLimiter = require('../utils/rate-limiter');

// POST /api/ai/generate-bio - Generate AI artist bio
router.post('/generate-bio', authenticate, rateLimiter('ai-bio', 10), [
    body('name').notEmpty().withMessage('Artist name is required'),
    body('genre').notEmpty().withMessage('Genre is required'),
    body('personalityTraits').isArray().withMessage('Personality traits must be an array'),
    body('visualStyle').notEmpty().withMessage('Visual style is required'),
    body('speakingStyle').optional().notEmpty().withMessage('Speaking style is required if provided'),
], validate, async (req, res, next) => {
    try {
        const { userId } = req;
        const result = await aiService.generateBio(userId, req.body, req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// POST /api/ai/generate-image - Generate AI artist image
router.post('/generate-image', authenticate, rateLimiter('ai-image', 5), [
    body('name').notEmpty().withMessage('Artist name is required'),
    body('visualStyle').notEmpty().withMessage('Visual style is required'),
    body('provider').optional().isIn(['nanobanana', 'seedance']).withMessage('Provider must be nanobanana or seedance'),
], validate, async (req, res, next) => {
    try {
        const { userId } = req;
        const result = await aiService.generateImage(userId, req.body, req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// POST /api/ai/generate-image-variations - Generate multiple image variations
router.post('/generate-image-variations', authenticate, rateLimiter('ai-image-variations', 3), [
    body('name').notEmpty().withMessage('Artist name is required'),
    body('visualStyle').notEmpty().withMessage('Visual style is required'),
    body('variationCount').optional().isInt({ min: 1, max: 10 }).withMessage('Variation count must be between 1 and 10'),
], validate, async (req, res, next) => {
    try {
        const { userId } = req;
        const { name, visualStyle, variationCount = 3, provider = ['nanobanana', 'seedance'], ...options } = req.body;
        const result = await aiService.generateImageVariations(userId, 
            { name, visualStyle, provider }, 
            variationCount, 
            options
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// POST /api/ai/rewrite-prompt - Rewrite and optimize music prompt
router.post('/rewrite-prompt', authenticate, rateLimiter('ai-prompt-rewrite', 20), [
    body('originalPrompt').notEmpty().withMessage('Original prompt is required'),
    body('genre').optional().notEmpty().withMessage('Genre must not be empty if provided'),
    body('mood').optional().notEmpty().withMessage('Mood must not be empty if provided'),
    body('style').optional().notEmpty().withMessage('Style must not be empty if provided'),
    body('targetPlatform').optional().isIn(['suno', 'udio', 'stability']).withMessage('Invalid target platform'),
    body('complexity').optional().isIn(['simple', 'medium', 'advanced']).withMessage('Complexity must be simple, medium, or advanced'),
], validate, async (req, res, next) => {
    try {
        const { userId } = req;
        const result = await aiService.rewritePrompt(userId, req.body, req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// POST /api/ai/analyze-prompt - Analyze prompt quality
router.post('/analyze-prompt', authenticate, rateLimiter('ai-prompt-analysis', 15), [
    body('prompt').notEmpty().withMessage('Prompt is required'),
], validate, async (req, res, next) => {
    try {
        const { userId } = req;
        const { prompt, ...options } = req.body;
        const result = await aiService.analyzePrompt(userId, prompt, options);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// POST /api/ai/generate-prompt-variations - Generate multiple prompt variations
router.post('/generate-prompt-variations', authenticate, rateLimiter('ai-prompt-variations', 10), [
    body('originalPrompt').notEmpty().withMessage('Original prompt is required'),
    body('variationCount').optional().isInt({ min: 1, max: 5 }).withMessage('Variation count must be between 1 and 5'),
], validate, async (req, res, next) => {
    try {
        const { userId } = req;
        const { originalPrompt, variationCount = 3, ...options } = req.body;
        const result = await aiService.generatePromptVariations(userId, originalPrompt, options, variationCount);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// GET /api/ai/generations - Get AI generation history
router.get('/generations', authenticate, [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('type').optional().isIn(['bio', 'image', 'prompt_rewrite', 'prompt_analysis', 'image_variations', 'prompt_variations']).withMessage('Invalid generation type'),
    query('provider').optional().isIn(['gemini', 'nanobanana', 'seedance', 'openai', 'fallback', 'any']).withMessage('Invalid provider'),
], validate, async (req, res, next) => {
    try {
        const { userId } = req;
        const { page = 1, limit = 20, type, provider } = req.query;
        const history = await aiService.getGenerationHistory(userId, { page, limit, type, provider });
        res.json(history);
    } catch (error) {
        next(error);
    }
});

// GET /api/ai/generations/:id - Get a specific generation
router.get('/generations/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req;
        const generation = await aiService.getGenerationById(id, userId);
        res.json(generation);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/ai/generations/:id - Delete a generation record
router.delete('/generations/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req;
        await aiService.deleteGeneration(id, userId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// GET /api/ai/services - Check AI service availability and health
router.get('/services', authenticate, rateLimiter('ai-services-status', 5), async (req, res, next) => {
    try {
        const services = await aiService.checkServiceAvailability();
        res.json(services);
    } catch (error) {
        next(error);
    }
});

// GET /api/ai/quotas - Get service quota information
router.get('/quotas', authenticate, rateLimiter('ai-quotas', 5), async (req, res, next) => {
    try {
        const quotas = await aiService.getServiceQuotas();
        res.json(quotas);
    } catch (error) {
        next(error);
    }
});

// GET /api/ai/cache-stats - Get cache statistics
router.get('/cache-stats', authenticate, rateLimiter('ai-cache-stats', 5), async (req, res, next) => {
    try {
        const stats = await aiService.getCacheStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

// POST /api/ai/clear-cache - Clear all AI service caches
router.post('/clear-cache', authenticate, rateLimiter('ai-clear-cache', 1), async (req, res, next) => {
    try {
        await aiService.clearAllCaches();
        res.json({ message: 'All caches cleared successfully' });
    } catch (error) {
        next(error);
    }
});

// GET /api/ai/stats - Get comprehensive AI service statistics
router.get('/stats', authenticate, rateLimiter('ai-stats', 5), async (req, res, next) => {
    try {
        const { userId } = req;
        const stats = await aiService.getServiceStats(userId);
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

// POST /api/ai/generate-description - Generate enhanced artist description
router.post('/generate-description', authenticate, rateLimiter('ai-description', 10), [
    body('name').notEmpty().withMessage('Artist name is required'),
    body('genre').notEmpty().withMessage('Genre is required'),
    body('style').optional().notEmpty().withMessage('Style must not be empty if provided'),
    body('descriptionType').optional().isIn(['short', 'long']).withMessage('Description type must be short or long'),
], validate, async (req, res, next) => {
    try {
        const { userId } = req;
        const { name, genre, style, descriptionType = 'short', ...options } = req.body;
        
        // Use Gemini service directly for description generation
        const result = await require('../services/gemini-service').generateDescription(userId, 
            { name, genre, style, targetAudience: options.targetAudience }, 
            descriptionType
        );
        
        res.json({ 
            description: result, 
            provider: 'gemini',
            type: descriptionType 
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/ai/optimize-image-prompt - Optimize image prompt for better results
router.post('/optimize-image-prompt', authenticate, rateLimiter('ai-optimize-prompt', 15), [
    body('basePrompt').notEmpty().withMessage('Base prompt is required'),
    body('style').notEmpty().withMessage('Style is required'),
    body('quality').optional().isIn(['low', 'medium', 'high']).withMessage('Quality must be low, medium, or high'),
], validate, async (req, res, next) => {
    try {
        const { userId } = req;
        const { basePrompt, style, quality = 'medium', provider = 'nanobanana' } = req.body;
        
        let optimizedPrompt;
        if (provider === 'nanobanana') {
            optimizedPrompt = await require('../services/nano-banana-service').optimizePrompt(basePrompt, style, quality);
        } else if (provider === 'seedance') {
            optimizedPrompt = await require('../services/seedance-service').optimizePrompt(basePrompt, style, quality);
        } else {
            throw new Error('Invalid provider for prompt optimization');
        }
        
        res.json({ 
            optimizedPrompt, 
            provider,
            quality 
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/ai/generate-with-artist-style - Generate image with specific artistic style
router.post('/generate-with-artist-style', authenticate, rateLimiter('ai-artist-style', 5), [
    body('name').notEmpty().withMessage('Artist name is required'),
    body('visualStyle').notEmpty().withMessage('Visual style is required'),
    body('artisticStyle').notEmpty().withMessage('Artistic style is required'),
], validate, async (req, res, next) => {
    try {
        const { userId } = req;
        const { name, visualStyle, artisticStyle, ...options } = req.body;
        
        // Use Seedance service for artistic style generation
        const imageUrl = await require('../services/seedance-service').generateWithArtisticStyle(userId, 
            { name, visualStyle, ...options }, 
            artisticStyle
        );
        
        res.json({ 
            imageUrl, 
            provider: 'seedance',
            artisticStyle 
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/ai/optimize-prompt-for-platform - Optimize prompt for specific platform
router.post('/optimize-prompt-for-platform', authenticate, rateLimiter('ai-platform-optimize', 10), [
    body('prompt').notEmpty().withMessage('Prompt is required'),
    body('platform').isIn(['suno', 'udio', 'stability']).withMessage('Invalid platform'),
], validate, async (req, res, next) => {
    try {
        const { userId } = req;
        const { prompt, platform, ...options } = req.body;
        
        const result = await require('../services/openai-service').optimizeForPlatform(userId, prompt, platform, options);
        
        res.json({ 
            ...result, 
            targetPlatform: platform 
        });
    } catch (error) {
        next(error);
    }
});

module.exports = (db) => {
    aiService.initialize(db);
    return router;
};