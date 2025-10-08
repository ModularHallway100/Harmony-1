// AI Artist Cache Service
// Integrates Redis caching with database operations for AI artists
const redis = require('../redis/config');
const databaseUtils = require('../utils/database-utils');
const { AIArtist } = require('../database/mongo-schema');

class AIArtistCacheService {
    constructor() {
        this.cacheEnabled = process.env.REDIS_ENABLED === 'true' || process.env.REDIS_ENABLED === undefined;
    }

    // Get AI Artist with cache fallback to database
    async getAIArtist(artistId) {
        if (!this.cacheEnabled) {
            return await this.getAIArtistFromDatabase(artistId);
        }

        try {
            // Try to get from cache first
            const cachedArtist = await redis.getCachedAIArtist(artistId);
            if (cachedArtist) {
                return cachedArtist;
            }

            // If not in cache, get from database
            const artist = await this.getAIArtistFromDatabase(artistId);
            
            // Cache the result for future requests
            if (artist) {
                await redis.cacheAIArtist(artistId, artist, 3600); // 1 hour cache
            }

            return artist;
        } catch (error) {
            console.error('Error getting AI artist:', error);
            // Fallback to database if cache fails
            return await this.getAIArtistFromDatabase(artistId);
        }
    }

    // Get AI Artist from database (MongoDB + PostgreSQL)
    async getAIArtistFromDatabase(artistId) {
        try {
            // Get from MongoDB first
            const mongoArtist = await databaseUtils.getAIArtistFromMongo(artistId);
            
            if (!mongoArtist) {
                return null;
            }

            // Get additional details from PostgreSQL
            const pgDetails = await databaseUtils.getAIArtistDetails(artistId);
            
            // Get images from PostgreSQL
            const pgImages = await databaseUtils.getAIArtistImages(artistId);

            // Combine data from both databases
            const combinedArtist = {
                ...mongoArtist,
                pgDetails: pgDetails || {},
                pgImages: pgImages || []
            };

            return combinedArtist;
        } catch (error) {
            console.error('Error getting AI artist from database:', error);
            throw error;
        }
    }

    // Create AI Artist with cache
    async createAIArtist(artistData) {
        try {
            // Create in MongoDB
            const mongoArtist = await databaseUtils.createAIArtistInMongo(artistData);
            
            // Create details in PostgreSQL
            const pgDetails = await databaseUtils.createAIArtistDetails(
                mongoArtist.artistId, 
                artistData.pgDetails || {}
            );

            // Combine the data
            const createdArtist = {
                ...mongoArtist,
                pgDetails: pgDetails || {},
                pgImages: []
            };

            // Cache the newly created artist
            if (this.cacheEnabled) {
                await redis.cacheAIArtist(mongoArtist.artistId, createdArtist, 3600);
                
                // Invalidate user's artists list cache
                await redis.invalidateAIArtistCacheByUserId(artistData.userId);
            }

            return createdArtist;
        } catch (error) {
            console.error('Error creating AI artist:', error);
            throw error;
        }
    }

    // Update AI Artist with cache
    async updateAIArtist(artistId, updates) {
        try {
            // Update in MongoDB
            const mongoUpdates = updates.mongo || {};
            const pgUpdates = updates.pg || {};
            
            const updatedMongo = await databaseUtils.updateAIArtistInMongo(artistId, mongoUpdates);
            
            let updatedPg = null;
            if (Object.keys(pgUpdates).length > 0) {
                updatedPg = await databaseUtils.updateAIArtistDetails(artistId, pgUpdates);
            }

            // Get the updated artist
            const updatedArtist = await this.getAIArtist(artistId);
            
            // Update cache
            if (this.cacheEnabled && updatedArtist) {
                await redis.cacheAIArtist(artistId, updatedArtist, 3600);
                
                // Invalidate user's artists list cache
                if (updatedArtist.userId) {
                    await redis.invalidateAIArtistCacheByUserId(updatedArtist.userId);
                }
            }

            return {
                ...updatedArtist,
                pgDetails: updatedPg || updatedArtist.pgDetails
            };
        } catch (error) {
            console.error('Error updating AI artist:', error);
            throw error;
        }
    }

    // Get user's AI Artists with cache
    async getUserAIArtists(userId) {
        if (!this.cacheEnabled) {
            return await this.getUserAIArtistsFromDatabase(userId);
        }

        try {
            // Try to get from cache first
            const cachedArtists = await redis.getCachedAIArtistsByUserId(userId);
            if (cachedArtists) {
                return cachedArtists;
            }

            // If not in cache, get from database
            const artists = await this.getUserAIArtistsFromDatabase(userId);
            
            // Cache the result for future requests
            if (artists.length > 0) {
                await redis.cacheAIArtistByUserId(userId, artists, 1800); // 30 minutes cache
            }

            return artists;
        } catch (error) {
            console.error('Error getting user AI artists:', error);
            // Fallback to database if cache fails
            return await this.getUserAIArtistsFromDatabase(userId);
        }
    }

    // Get user's AI Artists from database
    async getUserAIArtistsFromDatabase(userId) {
        try {
            // Get from MongoDB
            const mongoArtists = await AIArtist.find({ userId })
                .sort({ createdAt: -1 })
                .lean();

            // Get additional details for each artist
            const artistsWithDetails = await Promise.all(
                mongoArtists.map(async (artist) => {
                    const pgDetails = await databaseUtils.getAIArtistDetails(artist.artistId);
                    const pgImages = await databaseUtils.getAIArtistImages(artist.artistId);
                    
                    return {
                        ...artist,
                        pgDetails: pgDetails || {},
                        pgImages: pgImages || []
                    };
                })
            );

            return artistsWithDetails;
        } catch (error) {
            console.error('Error getting user AI artists from database:', error);
            throw error;
        }
    }

    // Get AI Artist Images with cache
    async getAIArtistImages(artistId) {
        if (!this.cacheEnabled) {
            return await databaseUtils.getAIArtistImages(artistId);
        }

        try {
            // Try to get from cache first
            const cachedImages = await redis.getCachedAIArtistImages(artistId);
            if (cachedImages) {
                return cachedImages;
            }

            // If not in cache, get from database
            const images = await databaseUtils.getAIArtistImages(artistId);
            
            // Cache the result for future requests
            if (images.length > 0) {
                await redis.cacheAIArtistImages(artistId, images, 3600); // 1 hour cache
            }

            return images;
        } catch (error) {
            console.error('Error getting AI artist images:', error);
            // Fallback to database if cache fails
            return await databaseUtils.getAIArtistImages(artistId);
        }
    }

    // Add AI Artist Image with cache
    async addAIArtistImage(artistId, imageData) {
        try {
            // Add to PostgreSQL
            const newImage = await databaseUtils.addAIArtistImage(artistId, imageData);
            
            // Update cache
            if (this.cacheEnabled) {
                // Invalidate images cache
                await redis.invalidateAIArtistCache(artistId);
                
                // Update artist cache with new image
                const artist = await this.getAIArtist(artistId);
                if (artist) {
                    await redis.cacheAIArtist(artistId, artist, 3600);
                }
            }

            return newImage;
        } catch (error) {
            console.error('Error adding AI artist image:', error);
            throw error;
        }
    }

    // Get AI Generation History with cache
    async getAIGenerationHistory(userId, limit = 50) {
        if (!this.cacheEnabled) {
            return await databaseUtils.getAIGenerationHistory(userId, limit);
        }

        try {
            // Try to get from cache first
            const cachedHistory = await redis.getCachedAIGenerationHistory(userId);
            if (cachedHistory) {
                return cachedHistory.slice(0, limit); // Apply limit to cached results
            }

            // If not in cache, get from database
            const history = await databaseUtils.getAIGenerationHistory(userId, limit);
            
            // Cache the result for future requests
            if (history.length > 0) {
                await redis.cacheAIGenerationHistory(userId, history, 1800); // 30 minutes cache
            }

            return history;
        } catch (error) {
            console.error('Error getting AI generation history:', error);
            // Fallback to database if cache fails
            return await databaseUtils.getAIGenerationHistory(userId, limit);
        }
    }

    // Add AI Generation History with cache
    async addAIGenerationHistory(generationData) {
        try {
            // Add to PostgreSQL
            const newHistory = await databaseUtils.addAIGenerationHistory(generationData);
            
            // Add to MongoDB
            await databaseUtils.addGenerationToAIArtistInMongo(
                generationData.artistId, 
                {
                    type: generationData.generationType,
                    prompt: generationData.prompt,
                    refinedPrompt: generationData.refinedPrompt,
                    parameters: generationData.parameters,
                    result: generationData.resultData,
                    serviceUsed: generationData.serviceUsed,
                    status: generationData.status,
                    errorMessage: generationData.errorMessage,
                    createdAt: new Date()
                }
            );
            
            // Update cache
            if (this.cacheEnabled) {
                // Invalidate user's generation history cache
                await redis.invalidateAIArtistCacheByUserId(generationData.userId);
                
                // Invalidate artist cache
                await redis.invalidateAIArtistCache(generationData.artistId);
            }

            return newHistory;
        } catch (error) {
            console.error('Error adding AI generation history:', error);
            throw error;
        }
    }

    // Search AI Artists with cache
    async searchAIArtists(query = {}, options = {}) {
        if (!this.cacheEnabled) {
            return await databaseUtils.searchAIArtists(query, options);
        }

        try {
            const { search = '' } = options;
            
            // Try to get from cache first if search query is provided
            if (search) {
                const cachedResults = await redis.getCachedAIArtistSearch(search);
                if (cachedResults) {
                    return cachedResults;
                }
            }

            // If not in cache, get from database
            const results = await databaseUtils.searchAIArtists(query, options);
            
            // Cache the result for future requests if search query is provided
            if (search) {
                await redis.cacheAIArtistSearch(search, results, 900); // 15 minutes cache
            }

            return results;
        } catch (error) {
            console.error('Error searching AI artists:', error);
            // Fallback to database if cache fails
            return await databaseUtils.searchAIArtists(query, options);
        }
    }

    // Get Popular AI Artists with cache
    async getPopularAIArtists(limit = 10) {
        if (!this.cacheEnabled) {
            return await databaseUtils.getPopularAIArtists(limit);
        }

        try {
            // Try to get from cache first
            const cachedPopular = await redis.getCachedPopularAIArtists();
            if (cachedPopular) {
                return cachedPopular.slice(0, limit); // Apply limit to cached results
            }

            // If not in cache, get from database
            const popularArtists = await databaseUtils.getPopularAIArtists(limit);
            
            // Cache the result for future requests
            if (popularArtists.length > 0) {
                await redis.cachePopularAIArtists(popularArtists, 1800); // 30 minutes cache
            }

            return popularArtists;
        } catch (error) {
            console.error('Error getting popular AI artists:', error);
            // Fallback to database if cache fails
            return await databaseUtils.getPopularAIArtists(limit);
        }
    }

    // Invalidate cache for an AI Artist
    async invalidateAIArtistCache(artistId) {
        if (!this.cacheEnabled) return;
        
        try {
            await redis.invalidateAIArtistCache(artistId);
        } catch (error) {
            console.error('Error invalidating AI artist cache:', error);
        }
    }

    // Invalidate cache for a user's AI Artists
    async invalidateAIArtistCacheByUserId(userId) {
        if (!this.cacheEnabled) return;
        
        try {
            await redis.invalidateAIArtistCacheByUserId(userId);
        } catch (error) {
            console.error('Error invalidating AI artist cache by user ID:', error);
        }
    }

    // Invalidate popular AI Artists cache
    async invalidatePopularAIArtistsCache() {
        if (!this.cacheEnabled) return;
        
        try {
            await redis.invalidatePopularAIArtistsCache();
        } catch (error) {
            console.error('Error invalidating popular AI artists cache:', error);
        }
    }

    // Warm up AI Artist cache
    async warmupAIArtistCache(artistIds) {
        if (!this.cacheEnabled) return;
        
        try {
            await redis.warmupAIArtistCache(artistIds);
        } catch (error) {
            console.error('Error warming up AI artist cache:', error);
        }
    }

    // Clear all AI Artist cache
    async clearAllAIArtistCache() {
        if (!this.cacheEnabled) return;
        
        try {
            // This is a simple implementation - in production, you might want to use Redis SCAN
            // to find all keys matching the patterns and delete them
            console.log('Clearing all AI Artist cache');
            // Add specific cache clearing logic here if needed
        } catch (error) {
            console.error('Error clearing AI artist cache:', error);
        }
    }
}

module.exports = new AIArtistCacheService();