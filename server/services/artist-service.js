// Artist Service for Harmony Music Platform
const { v4: uuidv4 } = require('uuid');
const redis = require('redis');
const { AIArtistAnalytics } = require('../models/mongo');
const aiService = require('./ai-service');
const nanoBananaService = require('./nano-banana-service');
const seedanceService = require('./seedance-service');

let db;
let redisClient;

async function initialize(database) {
    db = database;
    redisClient = redis.createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
}

const ARTIST_CACHE_KEY = (id) => `artist:${id}`;

async function getArtistById(id, userId) {
    const cachedArtist = await redisClient.get(ARTIST_CACHE_KEY(id));
    if (cachedArtist) return JSON.parse(cachedArtist);

    const { rows } = await db.postgres.query('SELECT * FROM artists WHERE id = $1 AND user_id = $2', [id, userId]);
    if (rows.length === 0) {
        throw new Error('Artist not found');
    }
    const artist = rows[0];

    if (artist.is_ai_artist) {
        const details = await db.postgres.query('SELECT * FROM ai_artist_details WHERE artist_id = $1', [id]);
        artist.details = details.rows[0];
        
        // Get image URLs if they exist
        const images = await db.postgres.query('SELECT * FROM ai_artist_images WHERE artist_id = $1', [id]);
        artist.images = images.rows;
    }

    await redisClient.set(ARTIST_CACHE_KEY(id), JSON.stringify(artist), { EX: 3600 }); // Cache for 1 hour
    return artist;
}

async function createArtist(userId, artistData) {
    const artistId = uuidv4();
    const { name, bio, genre, is_ai_artist, details, autoGenerateImage = true } = artistData;

    const { rows } = await db.postgres.query(
        'INSERT INTO artists (id, user_id, name, bio, genre, is_ai_artist) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [artistId, userId, name, bio, genre, is_ai_artist]
    );
    const newArtist = rows[0];

    if (is_ai_artist && details) {
        await db.postgres.query(
            'INSERT INTO ai_artist_details (artist_id, personality_traits, visual_style, speaking_style) VALUES ($1, $2, $3, $4)',
            [artistId, details.personality_traits, details.visual_style, details.speaking_style]
        );
        
        // Auto-generate AI image if enabled
        if (autoGenerateImage && details.visual_style) {
            try {
                // Generate multiple images using different providers
                const imageGenerationPromises = [];
                
                // Generate with Nano Banana
                imageGenerationPromises.push(
                    nanoBananaService.generateImage(userId, {
                        name: name,
                        visualStyle: details.visual_style,
                        style: details.personality_traits?.join(', ') || undefined
                    }).catch(err => {
                        console.error('Nano Banana image generation failed:', err);
                        return null;
                    })
                );
                
                // Generate with Seedance
                imageGenerationPromises.push(
                    seedanceService.generateImage(userId, {
                        name: name,
                        visualStyle: details.visual_style,
                        style: details.personality_traits?.join(', ') || undefined
                    }).catch(err => {
                        console.error('Seedance image generation failed:', err);
                        return null;
                    })
                );
                
                // Wait for all image generations to complete
                const imageResults = await Promise.all(imageGenerationPromises);
                const successfulImages = imageResults.filter(result => result && result.imageUrl);
                
                // Store successful images in database
                for (const imageResult of successfulImages) {
                    if (imageResult.imageUrl) {
                        await db.postgres.query(
                            'INSERT INTO ai_artist_images (artist_id, image_url, provider, prompt) VALUES ($1, $2, $3, $4)',
                            [artistId, imageResult.imageUrl, imageResult.provider, imageResult.prompt || '']
                        );
                    }
                }
                
                // Update artist with primary image URL
                if (successfulImages.length > 0) {
                    const primaryImage = successfulImages[0];
                    await db.postgres.query(
                        'UPDATE artists SET profile_image_url = $1 WHERE id = $2',
                        [primaryImage.imageUrl, artistId]
                    );
                }
            } catch (error) {
                console.error('AI image generation failed:', error);
                // Continue without image generation
            }
        }
        
        // Create analytics record
        const analytics = new AIArtistAnalytics({ artistId });
        await analytics.save();
    }
    
    return newArtist;
}

async function updateArtist(id, userId, updateData) {
    const { name, bio, genre, regenerateImage } = updateData;
    
    // Handle regular updates
    const { rows } = await db.postgres.query(
        'UPDATE artists SET name = $1, bio = $2, genre = $3, updated_at = NOW() WHERE id = $4 AND user_id = $5 RETURNING *',
        [name, bio, genre, id, userId]
    );

    if (rows.length === 0) {
        throw new Error('Artist not found');
    }

    // Handle image regeneration if requested
    if (regenerateImage && updateData.visualStyle) {
        try {
            // Get artist details
            const detailsResult = await db.postgres.query('SELECT * FROM ai_artist_details WHERE artist_id = $1', [id]);
            const details = detailsResult.rows[0];
            
            if (details) {
                // Generate new images
                const imageGenerationPromises = [];
                
                // Generate with Nano Banana
                imageGenerationPromises.push(
                    nanoBananaService.generateImage(userId, {
                        name: name,
                        visualStyle: updateData.visualStyle || details.visual_style,
                        style: details.personality_traits?.join(', ')
                    }).catch(err => {
                        console.error('Nano Banana image regeneration failed:', err);
                        return null;
                    })
                );
                
                // Generate with Seedance
                imageGenerationPromises.push(
                    seedanceService.generateImage(userId, {
                        name: name,
                        visualStyle: updateData.visualStyle || details.visual_style,
                        style: details.personality_traits?.join(', ')
                    }).catch(err => {
                        console.error('Seedance image regeneration failed:', err);
                        return null;
                    })
                );
                
                // Wait for all image generations to complete
                const imageResults = await Promise.all(imageGenerationPromises);
                const successfulImages = imageResults.filter(result => result && result.imageUrl);
                
                // Store new images in database
                for (const imageResult of successfulImages) {
                    if (imageResult.imageUrl) {
                        await db.postgres.query(
                            'INSERT INTO ai_artist_images (artist_id, image_url, provider, prompt) VALUES ($1, $2, $3, $4)',
                            [id, imageResult.imageUrl, imageResult.provider, imageResult.prompt || '']
                        );
                    }
                }
                
                // Update artist with primary image URL
                if (successfulImages.length > 0) {
                    const primaryImage = successfulImages[0];
                    await db.postgres.query(
                        'UPDATE artists SET profile_image_url = $1 WHERE id = $2',
                        [primaryImage.imageUrl, id]
                    );
                }
            }
        } catch (error) {
            console.error('AI image regeneration failed:', error);
            // Continue without image regeneration
        }
    }

    await redisClient.del(ARTIST_CACHE_KEY(id));
    return rows[0];
}

async function deleteArtist(id, userId) {
    const result = await db.postgres.query('DELETE FROM artists WHERE id = $1 AND user_id = $2', [id, userId]);
    if (result.rowCount === 0) {
        throw new Error('Artist not found');
    }
    await redisClient.del(ARTIST_CACHE_KEY(id));
    await AIArtistAnalytics.deleteOne({ artistId: id });
}

async function generateArtistImageVariations(id, userId, options = {}) {
    try {
        // Get artist details
        const artistResult = await db.postgres.query('SELECT * FROM artists WHERE id = $1 AND user_id = $2', [id, userId]);
        if (artistResult.rows.length === 0) {
            throw new Error('Artist not found');
        }
        
        const artist = artistResult.rows[0];
        const detailsResult = await db.postgres.query('SELECT * FROM ai_artist_details WHERE artist_id = $1', [id]);
        const details = detailsResult.rows[0];
        
        if (!details) {
            throw new Error('AI artist details not found');
        }
        
        const { name: artistName, visualStyle, personalityTraits } = details;
        const { variationCount = 3, providers = ['nanobanana', 'seedance'] } = options;
        
        const imageVariations = [];
        
        for (const provider of providers) {
            try {
                const result = await aiService.generateImageVariations(userId, {
                    name: artistName,
                    visualStyle,
                    provider
                }, variationCount, {
                    style: personalityTraits?.join(', ')
                });
                
                // Store variations in database
                for (const image of result.images) {
                    await db.postgres.query(
                        'INSERT INTO ai_artist_images (artist_id, image_url, provider, prompt, is_variation) VALUES ($1, $2, $3, $4, true)',
                        [id, image.imageUrl, image.provider, image.prompt || '']
                    );
                    imageVariations.push(image);
                }
            } catch (error) {
                console.error(`Failed to generate variations with ${provider}:`, error);
            }
        }
        
        return {
            artistId: id,
            variations: imageVariations,
            totalGenerated: imageVariations.length
        };
    } catch (error) {
        console.error('Failed to generate artist image variations:', error);
        throw error;
    }
}

async function getArtistImages(id, userId) {
    const result = await db.postgres.query('SELECT * FROM ai_artist_images WHERE artist_id = $1 ORDER BY created_at DESC', [id]);
    return result.rows;
}

async function deleteArtistImage(id, userId, imageId) {
    const result = await db.postgres.query(
        'DELETE FROM ai_artist_images WHERE id = $1 AND artist_id = $2 AND artist_id IN (SELECT id FROM artists WHERE user_id = $3)',
        [imageId, id, userId]
    );
    
    if (result.rowCount === 0) {
        throw new Error('Image not found or not authorized');
    }
    
    // Update profile image if this was the primary one
    const remainingImages = await db.postgres.query(
        'SELECT image_url FROM ai_artist_images WHERE artist_id = $1 ORDER BY created_at DESC LIMIT 1',
        [id]
    );
    
    if (remainingImages.rows.length > 0) {
        await db.postgres.query(
            'UPDATE artists SET profile_image_url = $1 WHERE id = $2',
            [remainingImages.rows[0].image_url, id]
        );
    }
    
    return { message: 'Image deleted successfully' };
}

module.exports = {
    initialize,
    getArtistById,
    createArtist,
    updateArtist,
    deleteArtist,
    generateArtistImageVariations,
    getArtistImages,
    deleteArtistImage,
};