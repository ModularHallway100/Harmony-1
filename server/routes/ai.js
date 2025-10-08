const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');
require('dotenv').config();

// Database connections
const postgresPool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const mongoClient = new MongoClient(process.env.MONGODB_URL);
let aiGenerationsCollection;

// Connect to MongoDB
mongoClient.connect()
  .then(() => {
    aiGenerationsCollection = mongoClient.db(process.env.MONGODB_DB_NAME).collection('aiGenerations');
    console.log('Connected to MongoDB for AI routes');
  })
  .catch(err => console.error('MongoDB connection error:', err));

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

// POST /api/ai/generate-bio - Generate AI artist bio
router.post('/generate-bio', authenticate, async (req, res) => {
  try {
    const { 
      name, 
      genre, 
      personalityTraits, 
      visualStyle, 
      speakingStyle,
      backstory,
      influences,
      uniqueElements
    } = req.body;
    
    const { userId } = req;
    
    // Validate input
    if (!name || !genre || !personalityTraits || !visualStyle || !speakingStyle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Call Google Gemini API
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }
    
    const prompt = `
    Create a compelling and creative bio for an AI artist named "${name}".
    
    Details:
    - Primary Genre: ${genre}
    - Personality Traits: ${personalityTraits.join(', ')}
    - Visual Style: ${visualStyle}
    - Speaking Style: ${speakingStyle}
    - Backstory: ${backstory || 'To be developed'}
    - Influences: ${influences || 'Various electronic and digital artists'}
    - Unique Elements: ${uniqueElements || 'Digital innovation and artistic experimentation'}
    
    Requirements:
    1. Make the bio engaging and creative (100-150 words)
    2. Reflect the AI nature of the artist
    3. Incorporate the personality traits and visual style
    4. Show musical innovation and uniqueness
    5. Write in a ${speakingStyle} tone
    6. End with a signature phrase that captures the artist's essence
    
    Return only the bio text without any additional formatting or explanation.
    `;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const bio = data.candidates[0].content.parts[0].text.trim();
    
    // Clean up the response by removing any markdown formatting
    const cleanedBio = bio.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\n/g, ' ');
    
    // Log the generation to MongoDB
    await aiGenerationsCollection.insertOne({
      userId,
      type: 'bio',
      input: {
        name,
        genre,
        personalityTraits,
        visualStyle,
        speakingStyle,
        backstory,
        influences,
        uniqueElements
      },
      output: cleanedBio,
      model: 'gemini-pro',
      timestamp: new Date(),
      success: true
    });
    
    res.json({ bio: cleanedBio });
  } catch (error) {
    console.error('Error generating bio:', error);
    
    // Log the failed generation
    await aiGenerationsCollection.insertOne({
      userId,
      type: 'bio',
      input: req.body,
      output: null,
      model: 'gemini-pro',
      timestamp: new Date(),
      success: false,
      error: error.message
    });
    
    // Fallback bio generation
    const { name, genre, personalityTraits, visualStyle, speakingStyle } = req.body;
    const fallbackBio = `${name} is an AI artist who blends ${genre} with ${visualStyle} aesthetics. With a ${speakingStyle} speaking style and ${personalityTraits.join(', ')} personality traits, ${name} creates music that pushes the boundaries of digital expression. Born from the intersection of technology and creativity, ${name} represents the future of musical innovation.`;
    
    res.json({ bio: fallbackBio });
  }
});

// POST /api/ai/generate-image - Generate AI artist image
router.post('/generate-image', authenticate, async (req, res) => {
  try {
    const { 
      name, 
      genre, 
      personalityTraits, 
      visualStyle,
      provider = 'nanobanana'
    } = req.body;
    
    const { userId } = req;
    
    // Validate input
    if (!name || !genre || !personalityTraits || !visualStyle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Generate prompt
    const prompt = `
    Generate a profile picture for an AI artist named "${name}" who creates ${genre} music.
    
    Style requirements:
    - Visual style: ${visualStyle}
    - Personality: ${personalityTraits.join(', ')}
    - Digital/AI aesthetic with artistic elements
    - Face should be visible and expressive
    - Background should complement the visual style
    - Professional and engaging appearance
    
    Create a unique, memorable portrait that captures the essence of this AI artist.
    `;
    
    let imageUrl;
    
    if (provider === 'nanobanana') {
      // Call Nano Banana API
      const nanoBananaApiKey = process.env.NANO_BANANA_API_KEY;
      if (!nanoBananaApiKey) {
        throw new Error('Nano Banana API key not configured');
      }
      
      const response = await fetch('https://api.nanobanana.com/v1/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nanoBananaApiKey}`,
        },
        body: JSON.stringify({
          prompt,
          model: 'stable-diffusion-xl',
          width: 512,
          height: 512,
          steps: 20,
          cfg_scale: 7,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Nano Banana API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      imageUrl = data.imageUrl;
    } else if (provider === 'seedance') {
      // Call Seedance API
      const seedanceApiKey = process.env.SEEDANCE_API_KEY;
      if (!seedanceApiKey) {
        throw new Error('Seedance API key not configured');
      }
      
      const response = await fetch('https://api.seedance.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${seedanceApiKey}`,
        },
        body: JSON.stringify({
          model: 'midjourney',
          prompt,
          size: '512x512',
          quality: 'standard',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Seedance API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      imageUrl = data.data[0].url;
    } else {
      throw new Error('Invalid image provider specified');
    }
    
    // Log the generation to MongoDB
    await aiGenerationsCollection.insertOne({
      userId,
      type: 'image',
      input: {
        name,
        genre,
        personalityTraits,
        visualStyle,
        provider
      },
      output: imageUrl,
      model: provider === 'nanobanana' ? 'stable-diffusion-xl' : 'midjourney',
      timestamp: new Date(),
      success: true
    });
    
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    
    // Log the failed generation
    await aiGenerationsCollection.insertOne({
      userId,
      type: 'image',
      input: req.body,
      output: null,
      model: req.body.provider || 'unknown',
      timestamp: new Date(),
      success: false,
      error: error.message
    });
    
    // Fallback to placeholder image
    const { name, visualStyle } = req.body;
    const fallbackImageUrl = `https://picsum.photos/seed/${name}-${visualStyle}/512/512`;
    
    res.json({ imageUrl: fallbackImageUrl });
  }
});

// GET /api/ai/generations - Get AI generation history
router.get('/generations', authenticate, async (req, res) => {
  try {
    const { userId } = req;
    const { page = 1, limit = 20, type } = req.query;
    
    const query = { userId };
    if (type) {
      query.type = type;
    }
    
    const skip = (page - 1) * limit;
    
    const generations = await aiGenerationsCollection
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await aiGenerationsCollection.countDocuments(query);
    
    res.json({
      generations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching generation history:', error);
    res.status(500).json({ error: 'Failed to fetch generation history' });
  }
});

// GET /api/ai/generations/:id - Get a specific generation
router.get('/generations/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    
    const generation = await aiGenerationsCollection.findOne({
      _id: require('mongodb').ObjectId(id),
      userId
    });
    
    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }
    
    res.json(generation);
  } catch (error) {
    console.error('Error fetching generation:', error);
    res.status(500).json({ error: 'Failed to fetch generation' });
  }
});

// DELETE /api/ai/generations/:id - Delete a generation record
router.delete('/generations/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    
    const result = await aiGenerationsCollection.deleteOne({
      _id: require('mongodb').ObjectId(id),
      userId
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Generation not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting generation:', error);
    res.status(500).json({ error: 'Failed to delete generation' });
  }
});

// GET /api/ai/services - Check AI service availability
router.get('/services', authenticate, async (req, res) => {
  try {
    const services = {
      gemini: !!process.env.GEMINI_API_KEY,
      nanobanana: !!process.env.NANO_BANANA_API_KEY,
      seedance: !!process.env.SEEDANCE_API_KEY
    };
    
    // Test Gemini API
    if (services.gemini) {
      try {
        const geminiApiKey = process.env.GEMINI_API_KEY;
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Test' }] }],
              generationConfig: { maxOutputTokens: 1 }
            }),
          }
        );
        services.gemini = response.ok;
      } catch (error) {
        services.gemini = false;
      }
    }
    
    // For demo purposes, assume other services are available if keys are present
    // In production, you would want to test these as well
    
    res.json(services);
  } catch (error) {
    console.error('Error checking service availability:', error);
    res.status(500).json({ error: 'Failed to check service availability' });
  }
});

module.exports = router;