// Database utility functions for AI Artist operations
const { Pool } = require('pg');
const mongoose = require('mongoose');
const { AIArtist, AIGenerationHistory } = require('../database/mongo-schema');

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// MongoDB connection
const connectMongoDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Get AI Artist Details from PostgreSQL
const getAIArtistDetails = async (artistId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ai_artist_details WHERE artist_id = $1',
      [artistId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching AI artist details:', error);
    throw error;
  }
};

// Create AI Artist Details in PostgreSQL
const createAIArtistDetails = async (artistId, details) => {
  try {
    const result = await pool.query(
      `INSERT INTO ai_artist_details (
        artist_id, personality_traits, visual_style, speaking_style, 
        backstory, influences, unique_elements, generation_parameters,
        performance_metrics, ai_training_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        artistId,
        details.personalityTraits,
        details.visualStyle,
        details.speakingStyle,
        details.backstory,
        details.influences,
        details.uniqueElements,
        details.generationParameters,
        details.performanceMetrics || {},
        details.aiTrainingData || {}
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating AI artist details:', error);
    throw error;
  }
};

// Update AI Artist Details in PostgreSQL
const updateAIArtistDetails = async (artistId, updates) => {
  try {
    const setClause = Object.keys(updates).map((key, index) => {
      const column = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      return `${column} = $${index + 2}`;
    }).join(', ');

    const values = [artistId, ...Object.values(updates)];

    const result = await pool.query(
      `UPDATE ai_artist_details 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE artist_id = $1 
      RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating AI artist details:', error);
    throw error;
  }
};

// Get AI Artist Images from PostgreSQL
const getAIArtistImages = async (artistId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ai_artist_images WHERE artist_id = $1 ORDER BY generated_at DESC',
      [artistId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching AI artist images:', error);
    throw error;
  }
};

// Add AI Artist Image in PostgreSQL
const addAIArtistImage = async (artistId, imageData) => {
  try {
    const result = await pool.query(
      `INSERT INTO ai_artist_images (
        artist_id, image_url, prompt, model, is_primary, tags
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        artistId,
        imageData.imageUrl,
        imageData.prompt,
        imageData.model,
        imageData.isPrimary || false,
        imageData.tags || []
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error adding AI artist image:', error);
    throw error;
  }
};

// Update AI Artist Image in PostgreSQL
const updateAIArtistImage = async (imageId, updates) => {
  try {
    const setClause = Object.keys(updates).map((key, index) => {
      const column = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      return `${column} = $${index + 2}`;
    }).join(', ');

    const values = [imageId, ...Object.values(updates)];

    const result = await pool.query(
      `UPDATE ai_artist_images 
      SET ${setClause} 
      WHERE id = $1 
      RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating AI artist image:', error);
    throw error;
  }
};

// Delete AI Artist Image in PostgreSQL
const deleteAIArtistImage = async (imageId) => {
  try {
    const result = await pool.query(
      'DELETE FROM ai_artist_images WHERE id = $1 RETURNING *',
      [imageId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting AI artist image:', error);
    throw error;
  }
};

// Get AI Generation History from PostgreSQL
const getAIGenerationHistory = async (userId, limit = 50) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ai_generation_history 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching AI generation history:', error);
    throw error;
  }
};

// Add AI Generation History in PostgreSQL
const addAIGenerationHistory = async (generationData) => {
  try {
    const result = await pool.query(
      `INSERT INTO ai_generation_history (
        user_id, artist_id, generation_type, prompt, refined_prompt,
        parameters, result_data, service_used, status, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        generationData.userId,
        generationData.artistId,
        generationData.generationType,
        generationData.prompt,
        generationData.refinedPrompt,
        generationData.parameters,
        generationData.resultData,
        generationData.serviceUsed,
        generationData.status,
        generationData.errorMessage
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error adding AI generation history:', error);
    throw error;
  }
};

// Update AI Generation History in PostgreSQL
const updateAIGenerationHistory = async (generationId, updates) => {
  try {
    const setClause = Object.keys(updates).map((key, index) => {
      const column = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      return `${column} = $${index + 2}`;
    }).join(', ');

    const values = [generationId, ...Object.values(updates)];

    const result = await pool.query(
      `UPDATE ai_generation_history 
      SET ${setClause} 
      WHERE id = $1 
      RETURNING *`,
      values
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating AI generation history:', error);
    throw error;
  }
};

// MongoDB Operations

// Get AI Artist from MongoDB
const getAIArtistFromMongo = async (artistId) => {
  try {
    await connectMongoDB();
    const artist = await AIArtist.findOne({ artistId }).lean();
    return artist;
  } catch (error) {
    console.error('Error fetching AI artist from MongoDB:', error);
    throw error;
  }
};

// Create AI Artist in MongoDB
const createAIArtistInMongo = async (artistData) => {
  try {
    await connectMongoDB();
    const artist = new AIArtist(artistData);
    await artist.save();
    return artist;
  } catch (error) {
    console.error('Error creating AI artist in MongoDB:', error);
    throw error;
  }
};

// Update AI Artist in MongoDB
const updateAIArtistInMongo = async (artistId, updates) => {
  try {
    await connectMongoDB();
    const artist = await AIArtist.findOneAndUpdate(
      { artistId },
      { $set: updates, $currentDate: { updatedAt: true } },
      { new: true, lean: true }
    );
    return artist;
  } catch (error) {
    console.error('Error updating AI artist in MongoDB:', error);
    throw error;
  }
};

// Add Image to AI Artist in MongoDB
const addImageToAIArtistInMongo = async (artistId, imageData) => {
  try {
    await connectMongoDB();
    const artist = await AIArtist.findOneAndUpdate(
      { artistId },
      { 
        $push: { 
          imageGallery: { 
            $each: [imageData], 
            $sort: { generatedAt: -1 } 
          } 
        },
        $currentDate: { updatedAt: true }
      },
      { new: true, lean: true }
    );
    return artist;
  } catch (error) {
    console.error('Error adding image to AI artist in MongoDB:', error);
    throw error;
  }
};

// Add Generation to AI Artist in MongoDB
const addGenerationToAIArtistInMongo = async (artistId, generationData) => {
  try {
    await connectMongoDB();
    const artist = await AIArtist.findOneAndUpdate(
      { artistId },
      { 
        $push: { 
          generationHistory: { 
            $each: [generationData], 
            $sort: { createdAt: -1 } 
          } 
        },
        $currentDate: { updatedAt: true }
      },
      { new: true, lean: true }
    );
    return artist;
  } catch (error) {
    console.error('Error adding generation to AI artist in MongoDB:', error);
    throw error;
  }
};

// Get AI Generation History from MongoDB
const getAIGenerationHistoryFromMongo = async (userId, limit = 50) => {
  try {
    await connectMongoDB();
    const history = await AIGenerationHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return history;
  } catch (error) {
    console.error('Error fetching AI generation history from MongoDB:', error);
    throw error;
  }
};

// Create AI Generation History in MongoDB
const createAIGenerationHistoryInMongo = async (generationData) => {
  try {
    await connectMongoDB();
    const history = new AIGenerationHistory(generationData);
    await history.save();
    return history;
  } catch (error) {
    console.error('Error creating AI generation history in MongoDB:', error);
    throw error;
  }
};

// Search AI Artists
const searchAIArtists = async (query = {}, options = {}) => {
  try {
    await connectMongoDB();
    const {
      limit = 20,
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = -1,
      search = ''
    } = options;

    let mongoQuery = {};

    // Add text search if provided
    if (search) {
      mongoQuery.$text = { $search: search };
    }

    // Apply additional filters
    if (query.userId) mongoQuery['artistId'] = query.userId;
    if (query.visualStyle) mongoQuery['persona.visualStyle'] = query.visualStyle;
    if (query.speakingStyle) mongoQuery['persona.speakingStyle'] = query.speakingStyle;
    if (query.genre) mongoQuery['musicStyle.primaryGenres'] = { $in: [query.genre] };

    const artists = await AIArtist.find(mongoQuery)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AIArtist.countDocuments(mongoQuery);

    return {
      artists,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error searching AI artists:', error);
    throw error;
  }
};

// Get Popular AI Artists
const getPopularAIArtists = async (limit = 10) => {
  try {
    await connectMongoDB();
    const artists = await AIArtist.find({})
      .sort({ 'performanceMetrics.engagementRate': -1 })
      .limit(limit)
      .lean();
    return artists;
  } catch (error) {
    console.error('Error fetching popular AI artists:', error);
    throw error;
  }
};

module.exports = {
  // PostgreSQL operations
  getAIArtistDetails,
  createAIArtistDetails,
  updateAIArtistDetails,
  getAIArtistImages,
  addAIArtistImage,
  updateAIArtistImage,
  deleteAIArtistImage,
  getAIGenerationHistory,
  addAIGenerationHistory,
  updateAIGenerationHistory,
  
  // MongoDB operations
  getAIArtistFromMongo,
  createAIArtistInMongo,
  updateAIArtistInMongo,
  addImageToAIArtistInMongo,
  addGenerationToAIArtistInMongo,
  getAIGenerationHistoryFromMongo,
  createAIGenerationHistoryInMongo,
  searchAIArtists,
  getPopularAIArtists,
  
  // Utility functions
  connectMongoDB
};