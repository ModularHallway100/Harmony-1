const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const { clerkClient } = require('@clerk/clerk-sdk-node');
require('dotenv').config();

// Database connections
const postgresPool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const mongoClient = new MongoClient(process.env.MONGODB_URL);
let mongoDb;

// Connect to MongoDB
mongoClient.connect()
  .then(() => {
    mongoDb = mongoClient.db(process.env.MONGODB_DB_NAME);
    console.log('Connected to MongoDB for artists routes');
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Import caching service
const aiArtistCacheService = require('../services/ai-artist-cache-service');

// Middleware to authenticate requests
const authenticate = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userId = userId;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// GET /api/artists - Get all artists for the current user
router.get('/', authenticate, async (req, res) => {
  try {
    const { userId } = req;
    
    // Get AI artists from cache or database
    const aiArtists = await aiArtistCacheService.getUserAIArtists(userId);
    
    // Get artists from PostgreSQL
    const postgresResult = await postgresPool.query(
      'SELECT * FROM artists WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    // Combine results
    const allArtists = [
      ...postgresResult.rows.map(artist => ({
        ...artist,
        type: 'traditional'
      })),
      ...aiArtists.map(artist => ({
        ...artist,
        type: 'ai'
      }))
    ];
    
    res.json(allArtists);
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});

// GET /api/artists/:id - Get a specific artist
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    
    // Check if it's an AI artist using cache
    const aiArtist = await aiArtistCacheService.getAIArtist(id);
    
    if (aiArtist && aiArtist.userId === userId) {
      return res.json({ ...aiArtist, type: 'ai' });
    }
    
    // Check if it's a traditional artist
    const artist = await postgresPool.query(
      'SELECT * FROM artists WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (artist.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    
    res.json({ ...artist.rows[0], type: 'traditional' });
  } catch (error) {
    console.error('Error fetching artist:', error);
    res.status(500).json({ error: 'Failed to fetch artist' });
  }
});

// POST /api/artists - Create a new artist
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      name,
      bio,
      genre,
      personalityTraits,
      visualStyle,
      speakingStyle,
      backstory,
      influences,
      uniqueElements,
      profileImage,
      isAI = false
    } = req.body;
    
    const { userId } = req;
    
    if (isAI) {
      // Create AI artist using caching service
      const artistData = {
        userId,
        name,
        bio,
        genre,
        personalityTraits: personalityTraits || [],
        visualStyle,
        speakingStyle,
        backstory,
        influences,
        uniqueElements,
        profileImage: profileImage || `https://picsum.photos/seed/${name}/400/400`,
        isAI: true,
        generationParameters: {
          model: 'gemini-pro',
          prompt: `AI artist ${name} creating ${genre} music with ${visualStyle} style`,
          createdAt: new Date()
        },
        performanceMetrics: {
          engagement: 0,
          popularity: 0,
          streams: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const newArtist = await aiArtistCacheService.createAIArtist(artistData);
      
      res.status(201).json({ ...newArtist, type: 'ai' });
    } else {
      // Create traditional artist in PostgreSQL
      const result = await postgresPool.query(
        `INSERT INTO artists (
          id, user_id, name, bio, genre, profile_image,
          is_ai_artist, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          require('crypto').randomUUID(),
          userId,
          name,
          bio,
          genre,
          profileImage || `https://picsum.photos/seed/${name}/400/400`,
          false,
          new Date()
        ]
      );
      
      res.status(201).json({ ...result.rows[0], type: 'traditional' });
    }
  } catch (error) {
    console.error('Error creating artist:', error);
    res.status(500).json({ error: 'Failed to create artist' });
  }
});

// PUT /api/artists/:id - Update an artist
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const updateData = req.body;
    
    // Check if it's an AI artist using cache
    const aiArtist = await aiArtistCacheService.getAIArtist(id);
    
    if (aiArtist && aiArtist.userId === userId) {
      // Update AI artist using caching service
      const updates = {
        mongo: updateData,
        pg: {
          name: updateData.name,
          bio: updateData.bio,
          genre: updateData.genre,
          profileImage: updateData.profileImage
        }
      };
      
      const updatedArtist = await aiArtistCacheService.updateAIArtist(id, updates);
      return res.json({ ...updatedArtist, type: 'ai' });
    }
    
    // Update traditional artist in PostgreSQL
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    if (updateData.name) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updateData.name);
    }
    if (updateData.bio) {
      fields.push(`bio = $${paramIndex++}`);
      values.push(updateData.bio);
    }
    if (updateData.genre) {
      fields.push(`genre = $${paramIndex++}`);
      values.push(updateData.genre);
    }
    if (updateData.profileImage) {
      fields.push(`profile_image = $${paramIndex++}`);
      values.push(updateData.profileImage);
    }
    
    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);
    values.push(userId);
    
    const result = await postgresPool.query(
      `UPDATE artists SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    
    res.json({ ...result.rows[0], type: 'traditional' });
  } catch (error) {
    console.error('Error updating artist:', error);
    res.status(500).json({ error: 'Failed to update artist' });
  }
});

// DELETE /api/artists/:id - Delete an artist
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    
    // Check if it's an AI artist using cache
    const aiArtist = await aiArtistCacheService.getAIArtist(id);
    
    if (aiArtist && aiArtist.userId === userId) {
      // Delete from MongoDB
      await mongoDb.collection('aiArtists').deleteOne({ _id: id, userId });
      
      // Delete from PostgreSQL
      await postgresPool.query(
        'DELETE FROM artists WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      // Delete from ai_artist_details table
      await postgresPool.query(
        'DELETE FROM ai_artist_details WHERE artist_id = $1',
        [id]
      );
      
      // Delete from ai_artist_images table
      await postgresPool.query(
        'DELETE FROM ai_artist_images WHERE artist_id = $1',
        [id]
      );
      
      // Delete from ai_generation_history table
      await postgresPool.query(
        'DELETE FROM ai_generation_history WHERE artist_id = $1',
        [id]
      );
      
      // Invalidate cache
      await aiArtistCacheService.invalidateAIArtistCache(id);
      await aiArtistCacheService.invalidateAIArtistCacheByUserId(userId);
      
      return res.status(204).send();
    }
    
    // Delete traditional artist from PostgreSQL
    const result = await postgresPool.query(
      'DELETE FROM artists WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting artist:', error);
    res.status(500).json({ error: 'Failed to delete artist' });
  }
});

// POST /api/artists/:id/image - Upload artist image
router.post('/:id/image', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    const imageUrl = `/uploads/artist-images/${req.file.filename}`;
    
    // Check if it's an AI artist using cache
    const aiArtist = await aiArtistCacheService.getAIArtist(id);
    
    if (aiArtist && aiArtist.userId === userId) {
      // Update AI artist image
      await mongoDb.collection('aiArtists').updateOne(
        { _id: id, userId },
        { $set: { profileImage: imageUrl, updatedAt: new Date() } }
      );
      
      // Also update in PostgreSQL
      await postgresPool.query(
        'UPDATE artists SET profile_image = $1, updated_at = $2 WHERE id = $3 AND user_id = $4',
        [imageUrl, new Date(), id, userId]
      );
      
      // Add image to ai_artist_images table
      await postgresPool.query(
        `INSERT INTO ai_artist_images (
          artist_id, image_url, prompt, model, is_primary, tags
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, imageUrl, 'user uploaded image', 'manual', true, []]
      );
      
      // Invalidate cache
      await aiArtistCacheService.invalidateAIArtistCache(id);
      
      return res.json({ imageUrl });
    }
    
    // Update traditional artist image
    await postgresPool.query(
      'UPDATE artists SET profile_image = $1, updated_at = $2 WHERE id = $3 AND user_id = $4',
      [imageUrl, new Date(), id, userId]
    );
    
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading artist image:', error);
    res.status(500).json({ error: 'Failed to upload artist image' });
  }
});

// POST /api/artists/:id/performance - Update artist performance metrics
router.post('/:id/performance', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { metrics } = req.body;
    
    // Check if it's an AI artist using cache
    const aiArtist = await aiArtistCacheService.getAIArtist(id);
    
    if (aiArtist && aiArtist.userId === userId) {
      // Update AI artist performance metrics
      const result = await mongoDb.collection('aiArtists').updateOne(
        { _id: id, userId },
        {
          $set: {
            'performanceMetrics.engagement': metrics.engagement,
            'performanceMetrics.popularity': metrics.popularity,
            'performanceMetrics.streams': metrics.streams,
            updatedAt: new Date()
          }
        }
      );
      
      // Also update PostgreSQL if needed
      await postgresPool.query(
        `UPDATE ai_artist_details SET
          performance_metrics = $1,
          updated_at = $2
        WHERE artist_id = $3`,
        [JSON.stringify(metrics), new Date(), id]
      );
      
      // Invalidate cache
      await aiArtistCacheService.invalidateAIArtistCache(id);
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Artist not found' });
      }
      
      res.json({ success: true });
    } else {
      return res.status(404).json({ error: 'Artist not found' });
    }
  } catch (error) {
    console.error('Error updating performance metrics:', error);
    res.status(500).json({ error: 'Failed to update performance metrics' });
  }
});

module.exports = router;