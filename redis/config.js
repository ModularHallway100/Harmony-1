// Redis Configuration for Harmony Music Platform
// This file sets up Redis for caching and session management

const redis = require('redis');
const { createClient } = require('redis');

class RedisManager {
    constructor() {
        this.client = null;
        this.sessionClient = null;
        this.isConnected = false;
    }

    // Initialize Redis client for caching
    async initializeCacheClient() {
        try {
            this.client = createClient({
                url: process.env.REDIS_CACHE_URL || 'redis://localhost:6379',
                socket: {
                    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
                }
            });

            this.client.on('error', (err) => {
                console.error('Redis Cache Client Error:', err);
            });

            this.client.on('connect', () => {
                console.log('Redis Cache Client Connected');
                this.isConnected = true;
            });

            this.client.on('reconnecting', () => {
                console.log('Redis Cache Client Reconnecting...');
            });

            this.client.on('end', () => {
                console.log('Redis Cache Client Disconnected');
                this.isConnected = false;
            });

            await this.client.connect();
            return this.client;
        } catch (error) {
            console.error('Failed to initialize Redis Cache Client:', error);
            throw error;
        }
    }

    // Initialize Redis client for sessions
    async initializeSessionClient() {
        try {
            this.sessionClient = createClient({
                url: process.env.REDIS_SESSION_URL || 'redis://localhost:6380',
                socket: {
                    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
                }
            });

            this.sessionClient.on('error', (err) => {
                console.error('Redis Session Client Error:', err);
            });

            this.sessionClient.on('connect', () => {
                console.log('Redis Session Client Connected');
            });

            this.sessionClient.on('reconnecting', () => {
                console.log('Redis Session Client Reconnecting...');
            });

            this.sessionClient.on('end', () => {
                console.log('Redis Session Client Disconnected');
            });

            await this.sessionClient.connect();
            return this.sessionClient;
        } catch (error) {
            console.error('Failed to initialize Redis Session Client:', error);
            throw error;
        }
    }

    // Generic cache operations
    async set(key, value, options = {}) {
        if (!this.isConnected || !this.client) {
            throw new Error('Redis Cache Client not connected');
        }

        const { ttl } = options;
        const serializedValue = JSON.stringify(value);

        if (ttl) {
            await this.client.setEx(key, ttl, serializedValue);
        } else {
            await this.client.set(key, serializedValue);
        }
    }

    async get(key) {
        if (!this.isConnected || !this.client) {
            throw new Error('Redis Cache Client not connected');
        }

        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
    }

    async del(key) {
        if (!this.isConnected || !this.client) {
            throw new Error('Redis Cache Client not connected');
        }

        await this.client.del(key);
    }

    async exists(key) {
        if (!this.isConnected || !this.client) {
            throw new Error('Redis Cache Client not connected');
        }

        return await this.client.exists(key);
    }

    async expire(key, ttl) {
        if (!this.isConnected || !this.client) {
            throw new Error('Redis Cache Client not connected');
        }

        await this.client.expire(key, ttl);
    }

    // Hash operations for user sessions
    async hset(key, field, value) {
        if (!this.sessionClient) {
            throw new Error('Redis Session Client not initialized');
        }

        const serializedValue = JSON.stringify(value);
        await this.sessionClient.hSet(key, field, serializedValue);
    }

    async hget(key, field) {
        if (!this.sessionClient) {
            throw new Error('Redis Session Client not initialized');
        }

        const value = await this.sessionClient.hGet(key, field);
        return value ? JSON.parse(value) : null;
    }

    async hgetall(key) {
        if (!this.sessionClient) {
            throw new Error('Redis Session Client not initialized');
        }

        const hash = await this.sessionClient.hGetAll(key);
        const result = {};
        
        for (const [field, value] of Object.entries(hash)) {
            result[field] = JSON.parse(value);
        }
        
        return result;
    }

    async hdel(key, field) {
        if (!this.sessionClient) {
            throw new Error('Redis Session Client not initialized');
        }

        await this.sessionClient.hDel(key, field);
    }

    async hexists(key, field) {
        if (!this.sessionClient) {
            throw new Error('Redis Session Client not initialized');
        }

        return await this.sessionClient.hExists(key, field);
    }

    // Set operations for tracking user activities
    async sadd(key, member) {
        if (!this.isConnected || !this.client) {
            throw new Error('Redis Cache Client not connected');
        }

        await this.client.sAdd(key, member);
    }

    async sismember(key, member) {
        if (!this.isConnected || !this.client) {
            throw new Error('Redis Cache Client not connected');
        }

        return await this.client.sIsMember(key, member);
    }

    async smembers(key) {
        if (!this.isConnected || !this.client) {
            throw new Error('Redis Cache Client not connected');
        }

        return await this.client.sMembers(key);
    }

    async srem(key, member) {
        if (!this.isConnected || !this.client) {
            throw new Error('Redis Cache Client not connected');
        }

        await this.client.sRem(key, member);
    }

    // List operations for queues
    async rpush(key, value) {
        if (!this.isConnected || !this.client) {
            throw new Error('Redis Cache Client not connected');
        }

        const serializedValue = JSON.stringify(value);
        await this.client.rPush(key, serializedValue);
    }

    async lpop(key) {
        if (!this.isConnected || !this.client) {
            throw new Error('Redis Cache Client not connected');
        }

        const value = await this.client.lPop(key);
        return value ? JSON.parse(value) : null;
    }

    async llen(key) {
        if (!this.isConnected || !this.client) {
            throw new Error('Redis Cache Client not connected');
        }

        return await this.client.lLen(key);
    }

    // Rate limiting utilities
    async rateLimit(key, windowInSeconds, maxRequests) {
        if (!this.isConnected || !this.client) {
            throw new Error('Redis Cache Client not connected');
        }

        const pipeline = this.client.multi();
        pipeline.incr(key);
        pipeline.expire(key, windowInSeconds);
        const results = await pipeline.exec();

        const currentRequests = results[0][1];
        return {
            allowed: currentRequests <= maxRequests,
            remaining: Math.max(0, maxRequests - currentRequests),
            resetTime: Date.now() + (windowInSeconds * 1000)
        };
    }

    // Cache utilities for common patterns
    async cacheUserSession(userId, sessionData, ttl = 3600) {
        const key = `session:${userId}`;
        await this.set(key, sessionData, { ttl });
    }

    async getCachedUserSession(userId) {
        const key = `session:${userId}`;
        return await this.get(key);
    }

    async cacheUserProfile(userId, profileData, ttl = 1800) {
        const key = `profile:${userId}`;
        await this.set(key, profileData, { ttl });
    }

    async getCachedUserProfile(userId) {
        const key = `profile:${userId}`;
        return await this.get(key);
    }

    async cacheTrackRecommendations(userId, recommendations, ttl = 1800) {
        const key = `recommendations:${userId}`;
        await this.set(key, recommendations, { ttl });
    }

    async getCachedTrackRecommendations(userId) {
        const key = `recommendations:${userId}`;
        return await this.get(key);
    }

    async cacheTrendingContent(contentType, contentData, ttl = 900) {
        const key = `trending:${contentType}`;
        await this.set(key, contentData, { ttl });
    }

    async getCachedTrendingContent(contentType) {
        const key = `trending:${contentType}`;
        return await this.get(key);
    }

    // AI Artist caching utilities
    async cacheAIArtist(artistId, artistData, ttl = 3600) {
        const key = `ai-artist:${artistId}`;
        await this.set(key, artistData, { ttl });
    }

    async getCachedAIArtist(artistId) {
        const key = `ai-artist:${artistId}`;
        return await this.get(key);
    }

    async cacheAIArtistByUserId(userId, artists, ttl = 1800) {
        const key = `ai-artists:${userId}`;
        await this.set(key, artists, { ttl });
    }

    async getCachedAIArtistsByUserId(userId) {
        const key = `ai-artists:${userId}`;
        return await this.get(key);
    }

    async cachePopularAIArtists(popularArtists, ttl = 1800) {
        const key = 'ai-artists:popular';
        await this.set(key, popularArtists, { ttl });
    }

    async getCachedPopularAIArtists() {
        const key = 'ai-artists:popular';
        return await this.get(key);
    }

    async cacheAIArtistImages(artistId, images, ttl = 3600) {
        const key = `ai-artist:images:${artistId}`;
        await this.set(key, images, { ttl });
    }

    async getCachedAIArtistImages(artistId) {
        const key = `ai-artist:images:${artistId}`;
        return await this.get(key);
    }

    async cacheAIGenerationHistory(userId, history, ttl = 1800) {
        const key = `ai-generation:history:${userId}`;
        await this.set(key, history, { ttl });
    }

    async getCachedAIGenerationHistory(userId) {
        const key = `ai-generation:history:${userId}`;
        return await this.get(key);
    }

    async cacheAIArtistSearch(query, results, ttl = 900) {
        const key = `ai-artist:search:${encodeURIComponent(query)}`;
        await this.set(key, results, { ttl });
    }

    async getCachedAIArtistSearch(query) {
        const key = `ai-artist:search:${encodeURIComponent(query)}`;
        return await this.get(key);
    }

    // Cache invalidation for AI Artists
    async invalidateAIArtistCache(artistId) {
        const keysToDelete = [
            `ai-artist:${artistId}`,
            `ai-artist:images:${artistId}`,
            `ai-artist:search:${artistId}`
        ];
        
        for (const key of keysToDelete) {
            await this.del(key);
        }
    }

    async invalidateAIArtistCacheByUserId(userId) {
        const keysToDelete = [
            `ai-artists:${userId}`,
            `ai-generation:history:${userId}`,
            `ai-artist:search:${userId}`
        ];
        
        for (const key of keysToDelete) {
            await this.del(key);
        }
    }

    async invalidatePopularAIArtistsCache() {
        await this.del('ai-artists:popular');
    }

    // Cache warming for AI Artists
    async warmupAIArtistCache(artistIds) {
        const batchSize = 10;
        const batches = [];
        
        for (let i = 0; i < artistIds.length; i += batchSize) {
            batches.push(artistIds.slice(i, i + batchSize));
        }
        
        for (const batch of batches) {
            await Promise.all(batch.map(artistId =>
                this.cacheAIArtist(artistId, `placeholder:${artistId}`)
            ));
        }
    }

    async warmupPopularAIArtistsCache() {
        await this.cachePopularAIArtists([]);
    }

    // Connection health check
    async checkHealth() {
        try {
            if (this.client) {
                await this.client.ping();
                console.log('Redis Cache Client is healthy');
            }
            
            if (this.sessionClient) {
                await this.sessionClient.ping();
                console.log('Redis Session Client is healthy');
            }
            
            return true;
        } catch (error) {
            console.error('Redis Health Check Failed:', error);
            return false;
        }
    }

    // Graceful shutdown
    async disconnect() {
        try {
            if (this.client) {
                await this.client.quit();
                console.log('Redis Cache Client Disconnected');
            }
            
            if (this.sessionClient) {
                await this.sessionClient.quit();
                console.log('Redis Session Client Disconnected');
            }
        } catch (error) {
            console.error('Error disconnecting from Redis:', error);
        }
    }
}

// Create singleton instance
const redisManager = new RedisManager();

// Export the manager and individual methods
module.exports = {
    redisManager,
    initializeCacheClient: () => redisManager.initializeCacheClient(),
    initializeSessionClient: () => redisManager.initializeSessionClient(),
    set: (key, value, options) => redisManager.set(key, value, options),
    get: (key) => redisManager.get(key),
    del: (key) => redisManager.del(key),
    exists: (key) => redisManager.exists(key),
    expire: (key, ttl) => redisManager.expire(key, ttl),
    hset: (key, field, value) => redisManager.hset(key, field, value),
    hget: (key, field) => redisManager.hget(key, field),
    hgetall: (key) => redisManager.hgetall(key),
    hdel: (key, field) => redisManager.hdel(key, field),
    hexists: (key, field) => redisManager.hexists(key, field),
    sadd: (key, member) => redisManager.sadd(key, member),
    sismember: (key, member) => redisManager.sismember(key, member),
    smembers: (key) => redisManager.smembers(key),
    srem: (key, member) => redisManager.srem(key, member),
    rpush: (key, value) => redisManager.rpush(key, value),
    lpop: (key) => redisManager.lpop(key),
    llen: (key) => redisManager.llen(key),
    rateLimit: (key, windowInSeconds, maxRequests) => redisManager.rateLimit(key, windowInSeconds, maxRequests),
    cacheUserSession: (userId, sessionData, ttl) => redisManager.cacheUserSession(userId, sessionData, ttl),
    getCachedUserSession: (userId) => redisManager.getCachedUserSession(userId),
    cacheUserProfile: (userId, profileData, ttl) => redisManager.cacheUserProfile(userId, profileData, ttl),
    getCachedUserProfile: (userId) => redisManager.getCachedUserProfile(userId),
    cacheTrackRecommendations: (userId, recommendations, ttl) => redisManager.cacheTrackRecommendations(userId, recommendations, ttl),
    getCachedTrackRecommendations: (userId) => redisManager.getCachedTrackRecommendations(userId),
    cacheTrendingContent: (contentType, contentData, ttl) => redisManager.cacheTrendingContent(contentType, contentData, ttl),
    getCachedTrendingContent: (contentType) => redisManager.getCachedTrendingContent(contentType),
    
    // AI Artist caching methods
    cacheAIArtist: (artistId, artistData, ttl) => redisManager.cacheAIArtist(artistId, artistData, ttl),
    getCachedAIArtist: (artistId) => redisManager.getCachedAIArtist(artistId),
    cacheAIArtistByUserId: (userId, artists, ttl) => redisManager.cacheAIArtistByUserId(userId, artists, ttl),
    getCachedAIArtistsByUserId: (userId) => redisManager.getCachedAIArtistsByUserId(userId),
    cachePopularAIArtists: (popularArtists, ttl) => redisManager.cachePopularAIArtists(popularArtists, ttl),
    getCachedPopularAIArtists: () => redisManager.getCachedPopularAIArtists(),
    cacheAIArtistImages: (artistId, images, ttl) => redisManager.cacheAIArtistImages(artistId, images, ttl),
    getCachedAIArtistImages: (artistId) => redisManager.getCachedAIArtistImages(artistId),
    cacheAIGenerationHistory: (userId, history, ttl) => redisManager.cacheAIGenerationHistory(userId, history, ttl),
    getCachedAIGenerationHistory: (userId) => redisManager.getCachedAIGenerationHistory(userId),
    cacheAIArtistSearch: (query, results, ttl) => redisManager.cacheAIArtistSearch(query, results, ttl),
    getCachedAIArtistSearch: (query) => redisManager.getCachedAIArtistSearch(query),
    
    // Cache invalidation methods
    invalidateAIArtistCache: (artistId) => redisManager.invalidateAIArtistCache(artistId),
    invalidateAIArtistCacheByUserId: (userId) => redisManager.invalidateAIArtistCacheByUserId(userId),
    invalidatePopularAIArtistsCache: () => redisManager.invalidatePopularAIArtistsCache(),
    
    // Cache warming methods
    warmupAIArtistCache: (artistIds) => redisManager.warmupAIArtistCache(artistIds),
    warmupPopularAIArtistsCache: () => redisManager.warmupPopularAIArtistsCache(),
    
    checkHealth: () => redisManager.checkHealth(),
    disconnect: () => redisManager.disconnect()
};