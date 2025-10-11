// AI Service for Harmony Music Platform - Enhanced with multiple AI providers
const { v4: uuidv4 } = require('uuid');
const { AIGenerationLog } = require('../models/mongo'); // Assuming models are centralized
const { config } = require('../config/ai-services');
const aiKeyManager = require('../utils/ai-key-manager');

// Import individual AI service modules
const geminiService = require('./gemini-service');
const nanoBananaService = require('./nano-banana-service');
const seedanceService = require('./seedance-service');
const openaiService = require('./openai-service');

let db;

function initialize(database) {
    db = database;
}

// Enhanced Bio Generation with fallback mechanisms
async function generateBio(userId, artistInfo, options = {}) {
    const { name, genre, personalityTraits, visualStyle, speakingStyle, backstory, influences, uniqueElements } = artistInfo;
    const generationId = uuidv4();
    const startTime = Date.now();
    const provider = options.provider || 'gemini';

    try {
        let bio;
        let usedProvider = provider;

        // Try primary provider first
        try {
            if (provider === 'gemini') {
                bio = await geminiService.generateBio(userId, artistInfo, options);
                usedProvider = 'gemini';
            } else {
                throw new Error('Invalid provider for bio generation');
            }
        } catch (primaryError) {
            console.warn(`Primary provider ${provider} failed, trying fallback...`, primaryError.message);
            
            // Fallback to enhanced fallback bio generation
            bio = generateEnhancedFallbackBio(artistInfo);
            usedProvider = 'fallback';
        }

        // Log to database
        await db.postgres.query(
            'INSERT INTO ai_generation_history (id, user_id, generation_type, status, result_data, provider) VALUES ($1, $2, $3, $4, $5, $6)',
            [generationId, userId, 'bio', 'completed', { bio, provider: usedProvider }, usedProvider]
        );
        
        const log = new AIGenerationLog({
            generationId,
            userId,
            parameters: { ...artistInfo, provider: usedProvider },
            result: { bio },
            duration: Date.now() - startTime,
            success: true
        });
        await log.save();

        return { bio, provider: usedProvider, generationId };
    } catch (error) {
        console.error('Error generating bio:', error);
        
        // Log failure
        await db.postgres.query(
            'INSERT INTO ai_generation_history (id, user_id, generation_type, status, error_message, provider) VALUES ($1, $2, $3, $4, $5, $6)',
            [generationId, userId, 'bio', 'failed', error.message, provider]
        );
        
        const log = new AIGenerationLog({
            generationId,
            userId,
            parameters: artistInfo,
            error: error.message,
            duration: Date.now() - startTime,
            success: false
        });
        await log.save();

        // Final fallback
        const fallbackBio = generateEnhancedFallbackBio(artistInfo);
        return { bio: fallbackBio, provider: 'fallback', generationId };
    }
}

// Enhanced fallback bio generation
function generateEnhancedFallbackBio(artistInfo) {
    const { name, genre, personalityTraits, visualStyle, speakingStyle } = artistInfo;
    const templates = config.bioTemplates[genre] || config.bioTemplates.electronic;
    
    return `${name} is an innovative AI artist who masters ${genre} with a unique ${visualStyle} approach. With ${personalityTraits.join(', ')} personality traits and a ${speakingStyle} speaking style, ${name} creates music that pushes the boundaries of digital expression. ${templates.signature}`;
}

// Enhanced Image Generation with multiple providers and fallbacks
async function generateImage(userId, imageRequest, options = {}) {
    const { name, visualStyle, provider = 'nanobanana' } = imageRequest;
    const generationId = uuidv4();
    const startTime = Date.now();
    const providers = Array.isArray(provider) ? provider : [provider];

    try {
        let imageUrl;
        let usedProvider;
        let errors = [];

        // Try providers in order
        for (const currentProvider of providers) {
            try {
                if (currentProvider === 'nanobanana') {
                    const request = { ...imageRequest, provider: 'nanobanana' };
                    imageUrl = await nanoBananaService.generateImage(userId, request, options);
                    usedProvider = 'nanobanana';
                    break;
                } else if (currentProvider === 'seedance') {
                    const request = { ...imageRequest, provider: 'seedance' };
                    imageUrl = await seedanceService.generateImage(userId, request, options);
                    usedProvider = 'seedance';
                    break;
                }
            } catch (providerError) {
                errors.push({ provider: currentProvider, error: providerError.message });
                console.warn(`Provider ${currentProvider} failed:`, providerError.message);
                continue;
            }
        }

        // If all providers failed, use fallback
        if (!imageUrl) {
            console.warn('All image providers failed, using fallback image');
            imageUrl = generateFallbackImageUrl(name, visualStyle);
            usedProvider = 'fallback';
        }

        // Log to database
        await db.postgres.query(
            'INSERT INTO ai_generation_history (id, user_id, generation_type, status, result_data, provider) VALUES ($1, $2, $3, $4, $5, $6)',
            [generationId, userId, 'image', 'completed', { imageUrl, provider: usedProvider }, usedProvider]
        );
        
        const log = new AIGenerationLog({
            generationId,
            userId,
            parameters: { ...imageRequest, provider: usedProvider },
            result: { imageUrl },
            duration: Date.now() - startTime,
            success: true,
            errors: errors.length > 0 ? errors : undefined
        });
        await log.save();

        return { imageUrl, provider: usedProvider, generationId, errors };
    } catch (error) {
        console.error('Error generating image:', error);
        
        // Log failure
        await db.postgres.query(
            'INSERT INTO ai_generation_history (id, user_id, generation_type, status, error_message, provider) VALUES ($1, $2, $3, $4, $5, $6)',
            [generationId, userId, 'image', 'failed', error.message, providers[0]]
        );
        
        const log = new AIGenerationLog({
            generationId,
            userId,
            parameters: imageRequest,
            error: error.message,
            duration: Date.now() - startTime,
            success: false
        });
        await log.save();

        // Final fallback
        const fallbackUrl = generateFallbackImageUrl(name, visualStyle);
        return { imageUrl: fallbackUrl, provider: 'fallback', generationId, errors: [{ error: error.message }] };
    }
}

// Generate fallback image URL
function generateFallbackImageUrl(name, visualStyle) {
    const seed = `${name}-${visualStyle}-${Date.now()}`;
    return `https://picsum.photos/seed/${seed}/512/512`;
}

// Enhanced Prompt Rewriting with OpenAI integration
async function rewritePrompt(userId, promptRequest, options = {}) {
    const generationId = uuidv4();
    const startTime = Date.now();

    try {
        const result = await openaiService.rewritePrompt(userId, promptRequest, options);

        // Log to database
        await db.postgres.query(
            'INSERT INTO ai_generation_history (id, user_id, generation_type, status, result_data, provider) VALUES ($1, $2, $3, $4, $5, $6)',
            [generationId, userId, 'prompt_rewrite', 'completed', {
                rewrittenPrompt: result.rewrittenPrompt,
                analysis: result.analysis,
                improvements: result.improvements
            }, 'openai']
        );
        
        const log = new AIGenerationLog({
            generationId,
            userId,
            parameters: { ...promptRequest, provider: 'openai' },
            result,
            duration: Date.now() - startTime,
            success: true
        });
        await log.save();

        return { ...result, provider: 'openai', generationId };
    } catch (error) {
        console.error('Error rewriting prompt:', error);
        
        // Log failure
        await db.postgres.query(
            'INSERT INTO ai_generation_history (id, user_id, generation_type, status, error_message, provider) VALUES ($1, $2, $3, $4, $5, $6)',
            [generationId, userId, 'prompt_rewrite', 'failed', error.message, 'openai']
        );
        
        const log = new AIGenerationLog({
            generationId,
            userId,
            parameters: promptRequest,
            error: error.message,
            duration: Date.now() - startTime,
            success: false
        });
        await log.save();

        // Fallback rewrite
        const fallbackResult = openaiService.generateFallbackRewrite(promptRequest);
        return { ...fallbackResult, provider: 'fallback', generationId };
    }
}

// Analyze prompt quality
async function analyzePrompt(userId, prompt, options = {}) {
    const generationId = uuidv4();
    const startTime = Date.now();

    try {
        const result = await openaiService.analyzePrompt(userId, prompt, options);

        // Log to database
        await db.postgres.query(
            'INSERT INTO ai_generation_history (id, user_id, generation_type, status, result_data, provider) VALUES ($1, $2, $3, $4, $5, $6)',
            [generationId, userId, 'prompt_analysis', 'completed', result, 'openai']
        );
        
        const log = new AIGenerationLog({
            generationId,
            userId,
            parameters: { prompt, provider: 'openai' },
            result,
            duration: Date.now() - startTime,
            success: true
        });
        await log.save();

        return { ...result, provider: 'openai', generationId };
    } catch (error) {
        console.error('Error analyzing prompt:', error);
        
        // Log failure
        await db.postgres.query(
            'INSERT INTO ai_generation_history (id, user_id, generation_type, status, error_message, provider) VALUES ($1, $2, $3, $4, $5, $6)',
            [generationId, userId, 'prompt_analysis', 'failed', error.message, 'openai']
        );
        
        const log = new AIGenerationLog({
            generationId,
            userId,
            parameters: { prompt },
            error: error.message,
            duration: Date.now() - startTime,
            success: false
        });
        await log.save();

        // Fallback analysis
        const fallbackResult = openaiService.generateFallbackAnalysis(prompt);
        return { ...fallbackResult, provider: 'fallback', generationId };
    }
}

// Enhanced generation history management
async function getGenerationHistory(userId, { page = 1, limit = 20, type, provider }) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM ai_generation_history WHERE user_id = $1';
    const params = [userId];

    if (type) {
        query += ' AND generation_type = $2';
        params.push(type);
    }

    if (provider) {
        query += provider === 'any' ? ' AND provider IS NOT NULL' : ' AND provider = $3';
        if (provider !== 'any') params.push(provider);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const { rows } = await db.postgres.query(query, params);
    return rows;
}

async function getGenerationById(id, userId) {
    const { rows } = await db.postgres.query('SELECT * FROM ai_generation_history WHERE id = $1 AND user_id = $2', [id, userId]);
    if (rows.length === 0) {
        throw new Error('Generation not found');
    }
    return rows[0];
}

async function deleteGeneration(id, userId) {
    const result = await db.postgres.query('DELETE FROM ai_generation_history WHERE id = $1 AND user_id = $2', [id, userId]);
    if (result.rowCount === 0) {
        throw new Error('Generation not found');
    }
    await AIGenerationLog.deleteOne({ generationId: id });
}

// Enhanced service availability check with health status
async function checkServiceAvailability() {
    const services = {
        gemini: { available: false, healthy: false, lastCheck: null },
        nanobanana: { available: false, healthy: false, lastCheck: null },
        seedance: { available: false, healthy: false, lastCheck: null },
        openai: { available: false, healthy: false, lastCheck: null }
    };

    try {
        // Check Gemini
        services.gemini.available = !!process.env.GOOGLE_GEMINI_API_KEY;
        services.gemini.healthy = await geminiService.checkHealth();
        services.gemini.lastCheck = new Date().toISOString();
    } catch (error) {
        console.error('Gemini service check failed:', error.message);
    }

    try {
        // Check Nano Banana
        services.nanobanana.available = !!process.env.NANO_BANANA_API_KEY;
        services.nanobanana.healthy = await nanoBananaService.checkHealth();
        services.nanobanana.lastCheck = new Date().toISOString();
    } catch (error) {
        console.error('Nano Banana service check failed:', error.message);
    }

    try {
        // Check Seedance
        services.seedance.available = !!process.env.SEEDANCE_API_KEY;
        services.seedance.healthy = await seedanceService.checkHealth();
        services.seedance.lastCheck = new Date().toISOString();
    } catch (error) {
        console.error('Seedance service check failed:', error.message);
    }

    try {
        // Check OpenAI
        services.openai.available = !!process.env.OPENAI_API_KEY;
        services.openai.healthy = await openaiService.checkHealth();
        services.openai.lastCheck = new Date().toISOString();
    } catch (error) {
        console.error('OpenAI service check failed:', error.message);
    }

    return services;
}

// Get service quota information
async function getServiceQuotas() {
    const quotas = {};
    
    try {
        quotas.gemini = await geminiService.getQuotaInfo();
    } catch (error) {
        quotas.gemini = { error: error.message };
    }

    try {
        quotas.nanobanana = await nanoBananaService.getQuotaInfo();
    } catch (error) {
        quotas.nanobanana = { error: error.message };
    }

    try {
        quotas.seedance = await seedanceService.getQuotaInfo();
    } catch (error) {
        quotas.seedance = { error: error.message };
    }

    try {
        quotas.openai = await openaiService.getQuotaInfo();
    } catch (error) {
        quotas.openai = { error: error.message };
    }

    return quotas;
}

// Get cache statistics for all services
async function getCacheStats() {
    const stats = {};
    
    try {
        stats.gemini = { type: 'bio', entries: 0 }; // Gemini doesn't cache
    } catch (error) {
        stats.gemini = { error: error.message };
    }

    try {
        stats.nanobanana = nanoBananaService.getCacheStats();
    } catch (error) {
        stats.nanobanana = { error: error.message };
    }

    try {
        stats.seedance = seedanceService.getCacheStats();
    } catch (error) {
        stats.seedance = { error: error.message };
    }

    try {
        stats.openai = openaiService.getCacheStats();
    } catch (error) {
        stats.openai = { error: error.message };
    }

    return stats;
}

// Clear all caches
async function clearAllCaches() {
    try {
        nanoBananaService.clearCache();
        console.log('Nano Banana cache cleared');
    } catch (error) {
        console.error('Failed to clear Nano Banana cache:', error);
    }

    try {
        seedanceService.clearCache();
        console.log('Seedance cache cleared');
    } catch (error) {
        console.error('Failed to clear Seedance cache:', error);
    }

    try {
        openaiService.clearCache();
        console.log('OpenAI cache cleared');
    } catch (error) {
        console.error('Failed to clear OpenAI cache:', error);
    }
}

// Generate multiple image variations
async function generateImageVariations(userId, baseImageRequest, variationCount = 3, options = {}) {
    const generationId = uuidv4();
    const startTime = Date.now();
    const providers = Array.isArray(baseImageRequest.provider) ? baseImageRequest.provider : ['nanobanana', 'seedance'];

    try {
        const variations = [];
        const errors = [];

        for (let i = 0; i < variationCount; i++) {
            let variationSuccess = false;
            
            // Try each provider for this variation
            for (const provider of providers) {
                try {
                    const variationRequest = {
                        ...baseImageRequest,
                        provider: provider,
                        prompt: `${baseImageRequest.prompt || ''} variation ${i + 1}`
                    };
                    
                    const result = await generateImage(userId, variationRequest, options);
                    variations.push({
                        imageUrl: result.imageUrl,
                        provider: result.provider,
                        generationId: result.generationId
                    });
                    variationSuccess = true;
                    break;
                } catch (providerError) {
                    errors.push({
                        variation: i + 1,
                        provider: provider,
                        error: providerError.message
                    });
                    continue;
                }
            }

            // If no provider worked for this variation, use fallback
            if (!variationSuccess) {
                const fallbackUrl = generateFallbackImageUrl(baseImageRequest.name, baseImageRequest.visualStyle);
                variations.push({
                    imageUrl: fallbackUrl,
                    provider: 'fallback',
                    generationId: uuidv4()
                });
            }
        }

        // Log to database
        await db.postgres.query(
            'INSERT INTO ai_generation_history (id, user_id, generation_type, status, result_data, provider) VALUES ($1, $2, $3, $4, $5, $6)',
            [generationId, userId, 'image_variations', 'completed', {
                variations: variations.length,
                providers: variations.map(v => v.provider)
            }, 'batch']
        );
        
        const log = new AIGenerationLog({
            generationId,
            userId,
            parameters: { ...baseImageRequest, variationCount, provider: 'batch' },
            result: { variations },
            duration: Date.now() - startTime,
            success: true,
            errors: errors.length > 0 ? errors : undefined
        });
        await log.save();

        return {
            variations,
            generationId,
            errors: errors.length > 0 ? errors : undefined,
            success: true
        };
    } catch (error) {
        console.error('Error generating image variations:', error);
        
        // Log failure
        await db.postgres.query(
            'INSERT INTO ai_generation_history (id, user_id, generation_type, status, error_message, provider) VALUES ($1, $2, $3, $4, $5, $6)',
            [generationId, userId, 'image_variations', 'failed', error.message, 'batch']
        );
        
        const log = new AIGenerationLog({
            generationId,
            userId,
            parameters: { ...baseImageRequest, variationCount },
            error: error.message,
            duration: Date.now() - startTime,
            success: false
        });
        await log.save();

        return {
            variations: [],
            generationId,
            errors: [{ error: error.message }],
            success: false
        };
    }
}

// Generate multiple prompt variations
async function generatePromptVariations(userId, basePrompt, options = {}, variationCount = 3) {
    const generationId = uuidv4();
    const startTime = Date.now();

    try {
        const variations = [];
        const errors = [];

        for (let i = 0; i < variationCount; i++) {
            try {
                const variationRequest = {
                    ...options,
                    originalPrompt: basePrompt,
                    complexity: options.complexity || 'medium'
                };
                
                const result = await openaiService.generatePromptVariations(userId, basePrompt, {
                    ...variationRequest,
                    variationCount: 1
                });
                
                variations.push({
                    prompt: result[0] || basePrompt, // Use first variation or fallback
                    provider: 'openai'
                });
            } catch (variationError) {
                console.error(`Failed to generate variation ${i + 1}:`, variationError);
                variations.push({
                    prompt: basePrompt, // Use original as fallback
                    provider: 'fallback'
                });
                errors.push({
                    variation: i + 1,
                    error: variationError.message
                });
            }
        }

        // Log to database
        await db.postgres.query(
            'INSERT INTO ai_generation_history (id, user_id, generation_type, status, result_data, provider) VALUES ($1, $2, $3, $4, $5, $6)',
            [generationId, userId, 'prompt_variations', 'completed', {
                variations: variations.length,
                providers: variations.map(v => v.provider)
            }, 'batch']
        );
        
        const log = new AIGenerationLog({
            generationId,
            userId,
            parameters: { ...options, originalPrompt: basePrompt, variationCount, provider: 'batch' },
            result: { variations },
            duration: Date.now() - startTime,
            success: true,
            errors: errors.length > 0 ? errors : undefined
        });
        await log.save();

        return {
            variations,
            generationId,
            errors: errors.length > 0 ? errors : undefined,
            success: true
        };
    } catch (error) {
        console.error('Error generating prompt variations:', error);
        
        // Log failure
        await db.postgres.query(
            'INSERT INTO ai_generation_history (id, user_id, generation_type, status, error_message, provider) VALUES ($1, $2, $3, $4, $5, $6)',
            [generationId, userId, 'prompt_variations', 'failed', error.message, 'batch']
        );
        
        const log = new AIGenerationLog({
            generationId,
            userId,
            parameters: { ...options, originalPrompt: basePrompt, variationCount },
            error: error.message,
            duration: Date.now() - startTime,
            success: false
        });
        await log.save();

        return {
            variations: [{ prompt: basePrompt, provider: 'fallback' }],
            generationId,
            errors: [{ error: error.message }],
            success: false
        };
    }
}

// Get comprehensive AI service statistics
async function getServiceStats(userId) {
    try {
        // Get generation counts by type
        const generationCounts = await db.postgres.query(
            `SELECT generation_type, COUNT(*) as count
             FROM ai_generation_history
             WHERE user_id = $1
             GROUP BY generation_type`,
            [userId]
        );

        // Get provider usage
        const providerUsage = await db.postgres.query(
            `SELECT provider, COUNT(*) as count
             FROM ai_generation_history
             WHERE user_id = $1 AND provider IS NOT NULL
             GROUP BY provider`,
            [userId]
        );

        // Get success/failure rates
        const successRates = await db.postgres.query(
            `SELECT
                generation_type,
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
                ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate
             FROM ai_generation_history
             WHERE user_id = $1
             GROUP BY generation_type`,
            [userId]
        );

        return {
            generationCounts: generationCounts.rows,
            providerUsage: providerUsage.rows,
            successRates: successRates.rows,
            totalGenerations: generationCounts.rows.reduce((sum, row) => sum + parseInt(row.count), 0)
        };
    } catch (error) {
        console.error('Error getting service stats:', error);
        return {
            error: error.message,
            generationCounts: [],
            providerUsage: [],
            successRates: [],
            totalGenerations: 0
        };
    }
}

module.exports = {
    initialize,
    // Core AI generation functions
    generateBio,
    generateImage,
    rewritePrompt,
    analyzePrompt,
    
    // Batch generation functions
    generateImageVariations,
    generatePromptVariations,
    
    // History and management functions
    getGenerationHistory,
    getGenerationById,
    deleteGeneration,
    
    // Service management functions
    checkServiceAvailability,
    getServiceQuotas,
    getCacheStats,
    clearAllCaches,
    getServiceStats
};