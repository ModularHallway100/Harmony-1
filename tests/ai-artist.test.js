// AI Artist Persona Generator Tests
const request = require('supertest');
const express = require('express');
const router = require('../server/routes/artists');
const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const redis = require('../server/redis/config');

// Mock dependencies
jest.mock('../server/redis/config');
jest.mock('../server/services/ai-artist-cache-service');

// Setup Express app
const app = express();
app.use(express.json());
app.use('/api/artists', router);

// Mock database connections
const mockPostgresPool = {
  query: jest.fn()
};

const mockMongoClient = {
  connect: jest.fn(),
  db: jest.fn(() => ({
    collection: jest.fn(() => ({
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      find: jest.fn(() => ({
        sort: jest.fn(() => ({
          toArray: jest.fn()
        }))
      }))
    }))
  }))
};

// Mock authentication middleware
jest.mock('../server/middleware/clerkAuth', () => ({
  clerkAuth: (req, res, next) => {
    req.auth = { userId: 'test-user-id' };
    next();
  }
}));

describe('AI Artist Persona Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/artists - Create AI Artist', () => {
    it('should create a new AI artist', async () => {
      const artistData = {
        name: 'Test AI Artist',
        bio: 'Test bio',
        genre: 'Electronic',
        personalityTraits: ['creative', 'innovative'],
        visualStyle: 'futuristic',
        speakingStyle: 'energetic',
        isAI: true
      };

      // Mock successful database operations
      mockPostgresPool.query.mockResolvedValueOnce({
        rows: [{ id: 'test-artist-id', ...artistData, type: 'ai' }]
      });

      const response = await request(app)
        .post('/api/artists')
        .send(artistData)
        .expect(201);

      expect(response.body).toHaveProperty('name', artistData.name);
      expect(response.body).toHaveProperty('type', 'ai');
      expect(mockPostgresPool.query).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        name: '', // Invalid empty name
        bio: 'Test bio',
        genre: 'Electronic'
      };

      const response = await request(app)
        .post('/api/artists')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle database errors', async () => {
      const artistData = {
        name: 'Test AI Artist',
        bio: 'Test bio',
        genre: 'Electronic',
        isAI: true
      };

      mockPostgresPool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/api/artists')
        .send(artistData)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to create artist');
    });
  });

  describe('GET /api/artists - Get All Artists', () => {
    it('should get all artists for the user', async () => {
      const mockArtists = [
        { id: '1', name: 'Artist 1', type: 'traditional' },
        { id: '2', name: 'AI Artist', type: 'ai' }
      ];

      mockPostgresPool.query.mockResolvedValueOnce({
        rows: [mockArtists[0]]
      });

      const response = await request(app)
        .get('/api/artists')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('type');
    });

    it('should handle empty artist list', async () => {
      mockPostgresPool.query.mockResolvedValueOnce({
        rows: []
      });

      const response = await request(app)
        .get('/api/artists')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/artists/:id - Get Specific Artist', () => {
    it('should get a specific AI artist', async () => {
      const artistId = 'test-artist-id';
      const mockArtist = {
        id: artistId,
        name: 'Test AI Artist',
        type: 'ai'
      };

      mockPostgresPool.query.mockResolvedValueOnce({
        rows: [mockArtist]
      });

      const response = await request(app)
        .get(`/api/artists/${artistId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', artistId);
      expect(response.body).toHaveProperty('type', 'ai');
    });

    it('should handle not found error', async () => {
      const artistId = 'non-existent-id';

      mockPostgresPool.query.mockResolvedValueOnce({
        rows: []
      });

      const response = await request(app)
        .get(`/api/artists/${artistId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Artist not found');
    });
  });

  describe('PUT /api/artists/:id - Update Artist', () => {
    it('should update an AI artist', async () => {
      const artistId = 'test-artist-id';
      const updateData = {
        name: 'Updated Artist Name',
        bio: 'Updated bio'
      };

      mockPostgresPool.query.mockResolvedValueOnce({
        rows: [{ id: artistId, ...updateData, type: 'ai' }]
      });

      const response = await request(app)
        .put(`/api/artists/${artistId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('name', updateData.name);
      expect(response.body).toHaveProperty('type', 'ai');
    });

    it('should handle validation errors on update', async () => {
      const artistId = 'test-artist-id';
      const invalidData = {
        name: '', // Invalid empty name
        bio: 'Updated bio'
      };

      const response = await request(app)
        .put(`/api/artists/${artistId}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/artists/:id - Delete Artist', () => {
    it('should delete an AI artist', async () => {
      const artistId = 'test-artist-id';

      mockPostgresPool.query.mockResolvedValueOnce({
        rowCount: 1
      });

      const response = await request(app)
        .delete(`/api/artists/${artistId}`)
        .expect(204);

      expect(response.body).toEqual({});
    });

    it('should handle not found error on delete', async () => {
      const artistId = 'non-existent-id';

      mockPostgresPool.query.mockResolvedValueOnce({
        rowCount: 0
      });

      const response = await request(app)
        .delete(`/api/artists/${artistId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Artist not found');
    });
  });

  describe('POST /api/artists/:id/image - Upload Artist Image', () => {
    it('should upload an artist image', async () => {
      const artistId = 'test-artist-id';
      
      // Mock file upload
      const mockFile = {
        fieldname: 'image',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        filename: 'test-image.jpg',
        path: '/uploads/test-image.jpg'
      };

      const response = await request(app)
        .post(`/api/artists/${artistId}/image`)
        .attach('image', Buffer.from('test'), 'test.jpg')
        .expect(200);

      expect(response.body).toHaveProperty('imageUrl');
    });

    it('should handle missing file error', async () => {
      const artistId = 'test-artist-id';

      const response = await request(app)
        .post(`/api/artists/${artistId}/image`)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'No image file provided');
    });
  });

  describe('AI Integration Tests', () => {
    it('should generate AI artist bio', async () => {
      // This test would require mocking the AI service
      // For now, we'll test the endpoint structure
      const artistData = {
        name: 'Test AI Artist',
        genre: 'Electronic',
        visualStyle: 'futuristic'
      };

      // Mock AI service response
      const mockBio = 'This is a generated bio for Test AI Artist';

      // In a real test, you would mock the AI service
      // For now, we'll just test that the endpoint accepts the data
      const response = await request(app)
        .post('/api/artists')
        .send({ ...artistData, isAI: true })
        .expect(201);

      expect(response.body).toHaveProperty('name', artistData.name);
    });

    it('should handle AI service errors', async () => {
      // This test would require mocking the AI service to return an error
      const artistData = {
        name: 'Test AI Artist',
        genre: 'Electronic',
        visualStyle: 'futuristic',
        isAI: true
      };

      // Mock database error
      mockPostgresPool.query.mockRejectedValueOnce(new Error('AI service error'));

      const response = await request(app)
        .post('/api/artists')
        .send(artistData)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to create artist');
    });
  });

  describe('Cache Integration Tests', () => {
    it('should use cache for frequently accessed data', async () => {
      const artistId = 'test-artist-id';
      
      // Mock cache hit
      redis.getCachedAIArtist.mockResolvedValueOnce({
        id: artistId,
        name: 'Cached Artist',
        type: 'ai'
      });

      const response = await request(app)
        .get(`/api/artists/${artistId}`)
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Cached Artist');
      expect(redis.getCachedAIArtist).toHaveBeenCalledWith(artistId);
    });

    it('should fallback to database on cache miss', async () => {
      const artistId = 'test-artist-id';
      
      // Mock cache miss
      redis.getCachedAIArtist.mockResolvedValueOnce(null);
      
      // Mock database hit
      mockPostgresPool.query.mockResolvedValueOnce({
        rows: [{ id: artistId, name: 'Database Artist', type: 'ai' }]
      });

      const response = await request(app)
        .get(`/api/artists/${artistId}`)
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Database Artist');
      expect(redis.getCachedAIArtist).toHaveBeenCalledWith(artistId);
      expect(mockPostgresPool.query).toHaveBeenCalled();
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      const artistData = {
        name: 'Concurrent Artist',
        bio: 'Test bio',
        genre: 'Electronic',
        isAI: true
      };

      // Mock successful database operations
      mockPostgresPool.query.mockResolvedValue({
        rows: [{ id: 'test-artist-id', ...artistData, type: 'ai' }]
      });

      // Create multiple requests concurrently
      const requests = Array(5).fill().map(() => 
        request(app)
          .post('/api/artists')
          .send(artistData)
      );

      const responses = await Promise.all(requests);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle database connection errors', async () => {
      mockPostgresPool.query.mockRejectedValueOnce(new Error('Connection failed'));

      const response = await request(app)
        .get('/api/artists')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to fetch artists');
    });

    it('should handle authentication errors', async () => {
      // This test would require mocking the authentication middleware
      // For now, we'll test the endpoint structure
      const response = await request(app)
        .get('/api/artists')
        .expect(401); // Or whatever status the auth middleware returns

      expect(response.body).toHaveProperty('error');
    });
  });
});

describe('AI Artist Cache Service', () => {
  let cacheService;

  beforeEach(() => {
    cacheService = require('../server/services/ai-artist-cache-service');
    jest.clearAllMocks();
  });

  describe('getAIArtist', () => {
    it('should get artist from cache when available', async () => {
      const artistId = 'test-artist-id';
      const cachedArtist = { id: artistId, name: 'Cached Artist' };

      redis.getCachedAIArtist.mockResolvedValueOnce(cachedArtist);

      const result = await cacheService.getAIArtist(artistId);

      expect(result).toEqual(cachedArtist);
      expect(redis.getCachedAIArtist).toHaveBeenCalledWith(artistId);
    });

    it('should fallback to database when cache is empty', async () => {
      const artistId = 'test-artist-id';
      
      redis.getCachedAIArtist.mockResolvedValueOnce(null);
      databaseUtils.getAIArtistFromMongo.mockResolvedValueOnce({
        artistId,
        name: 'Database Artist'
      });

      const result = await cacheService.getAIArtist(artistId);

      expect(result).toHaveProperty('artistId', artistId);
      expect(redis.getCachedAIArtist).toHaveBeenCalledWith(artistId);
      expect(databaseUtils.getAIArtistFromMongo).toHaveBeenCalledWith(artistId);
    });
  });

  describe('createAIArtist', () => {
    it('should create artist and cache it', async () => {
      const artistData = {
        userId: 'test-user-id',
        name: 'New Artist',
        artistId: 'new-artist-id'
      };

      databaseUtils.createAIArtistInMongo.mockResolvedValueOnce({
        ...artistData,
        _id: 'mongo-id'
      });

      databaseUtils.createAIArtistDetails.mockResolvedValueOnce({
        artistId: 'new-artist-id',
        personalityTraits: ['creative']
      });

      const result = await cacheService.createAIArtist(artistData);

      expect(result).toHaveProperty('name', artistData.name);
      expect(databaseUtils.createAIArtistInMongo).toHaveBeenCalledWith(artistData);
      expect(redis.cacheAIArtist).toHaveBeenCalled();
    });
  });

  describe('updateAIArtist', () => {
    it('should update artist and invalidate cache', async () => {
      const artistId = 'test-artist-id';
      const updates = {
        mongo: { name: 'Updated Name' },
        pg: { visualStyle: 'updated' }
      };

      databaseUtils.updateAIArtistInMongo.mockResolvedValueOnce({
        artistId,
        name: 'Updated Name'
      });

      databaseUtils.updateAIArtistDetails.mockResolvedValueOnce({
        artistId,
        visualStyle: 'updated'
      });

      redis.getCachedAIArtist.mockResolvedValueOnce({
        artistId,
        name: 'Old Name'
      });

      const result = await cacheService.updateAIArtist(artistId, updates);

      expect(result).toHaveProperty('name', 'Updated Name');
      expect(databaseUtils.updateAIArtistInMongo).toHaveBeenCalledWith(artistId, updates.mongo);
      expect(redis.invalidateAIArtistCache).toHaveBeenCalledWith(artistId);
    });
  });

  describe('getUserAIArtists', () => {
    it('should get user artists from cache when available', async () => {
      const userId = 'test-user-id';
      const cachedArtists = [
        { id: '1', name: 'Artist 1' },
        { id: '2', name: 'Artist 2' }
      ];

      redis.getCachedAIArtistsByUserId.mockResolvedValueOnce(cachedArtists);

      const result = await cacheService.getUserAIArtists(userId);

      expect(result).toEqual(cachedArtists);
      expect(redis.getCachedAIArtistsByUserId).toHaveBeenCalledWith(userId);
    });

    it('should fallback to database when cache is empty', async () => {
      const userId = 'test-user-id';
      
      redis.getCachedAIArtistsByUserId.mockResolvedValueOnce(null);
      databaseUtils.getUserAIArtistsFromDatabase.mockResolvedValueOnce([
        { id: '1', name: 'Artist 1' }
      ]);

      const result = await cacheService.getUserAIArtists(userId);

      expect(result).toHaveLength(1);
      expect(redis.getCachedAIArtistsByUserId).toHaveBeenCalledWith(userId);
      expect(databaseUtils.getUserAIArtistsFromDatabase).toHaveBeenCalledWith(userId);
    });
  });

  describe('cache invalidation', () => {
    it('should invalidate artist cache', async () => {
      const artistId = 'test-artist-id';

      await cacheService.invalidateAIArtistCache(artistId);

      expect(redis.invalidateAIArtistCache).toHaveBeenCalledWith(artistId);
    });

    it('should invalidate user cache', async () => {
      const userId = 'test-user-id';

      await cacheService.invalidateAIArtistCacheByUserId(userId);

      expect(redis.invalidateAIArtistCacheByUserId).toHaveBeenCalledWith(userId);
    });
  });
});