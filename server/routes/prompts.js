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
    console.log('Connected to MongoDB for prompt routes');
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

// POST /api/prompts/rewrite - Rewrite and optimize a music prompt
router.post('/rewrite', authenticate, async (req, res) => {
  try {
    const {
      basePrompt,
      genre,
      mood,
      tempo,
      instrumentation,
      style,
      optimizationLevel = 'standard',
      targetPlatforms = ['suno']
    } = req.body;

    const { userId } = req;

    // Validate input
    if (!basePrompt || !basePrompt.trim()) {
      return res.status(400).json({ error: 'Base prompt is required' });
    }

    if (!genre || !mood) {
      return res.status(400).json({ error: 'Genre and mood are required' });
    }

    // Call Google Gemini API for prompt optimization
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Build optimization prompt based on level
    let optimizationPrompt = '';
    switch (optimizationLevel) {
      case 'basic':
        optimizationPrompt = `Rewrite this music prompt to be more detailed and creative for AI music generation.`;
        break;
      case 'standard':
        optimizationPrompt = `Enhance this music prompt with specific details about instruments, structure, and emotional impact for high-quality AI music generation.`;
        break;
      case 'advanced':
        optimizationPrompt = `Transform this music prompt into a comprehensive, professional-grade prompt with detailed instrumentation, arrangement suggestions, production techniques, and emotional depth for superior AI music generation.`;
        break;
      case 'expert':
        optimizationPrompt = `Create an expert-level music prompt with technical specifications, production details, arrangement breakdown, emotional journey mapping, and platform-specific optimizations for multiple AI music generation services.`;
        break;
      default:
        optimizationPrompt = `Enhance this music prompt with specific details about instruments, structure, and emotional impact for high-quality AI music generation.`;
    }

    // Build platform-specific optimizations
    let platformOptimizations = '';
    if (targetPlatforms.includes('suno')) {
      platformOptimizations += ' Optimize for Suno AI with clear sections (verse, chorus, bridge), instrumental layers, and emotional progression.';
    }
    if (targetPlatforms.includes('udio')) {
      platformOptimizations += ' Optimize for Udio with detailed descriptions of instruments, vocal styles, and production elements.';
    }

    const fullPrompt = `
      ${optimizationPrompt}
      
      Original Idea: "${basePrompt}"
      Genre: ${genre}
      Mood: ${mood}
      Tempo: ${tempo || 'unspecified'}
      Instrumentation: ${instrumentation ? instrumentation.join(', ') : 'unspecified'}
      Style: ${style || 'unspecified'}
      
      Requirements:
      1. Make the prompt detailed, creative, and engaging
      2. Include specific instruments and musical elements
      3. Suggest song structure and arrangement
      4. Add emotional depth and atmosphere
      5. Include production quality descriptors
      6. Make it suitable for ${targetPlatforms.join(', ')}${platformOptimizations}
      7. Keep it concise but comprehensive (150-250 words)
      8. End with a strong, evocative closing statement
      
      Return only the enhanced prompt without any additional formatting or explanation.
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
            parts: [{ text: fullPrompt }]
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
    let refinedPrompt = data.candidates[0].content.parts[0].text.trim();

    // Clean up the response
    refinedPrompt = refinedPrompt.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\n/g, ' ');

    // Log the generation to MongoDB
    await aiGenerationsCollection.insertOne({
      userId,
      type: 'prompt_rewrite',
      input: {
        basePrompt,
        genre,
        mood,
        tempo,
        instrumentation,
        style,
        optimizationLevel,
        targetPlatforms
      },
      output: refinedPrompt,
      model: 'gemini-pro',
      timestamp: new Date(),
      success: true
    });

    // Return the refined prompt
    res.json({
      success: true,
      refinedPrompt,
      metadata: {
        genre,
        mood,
        tempo,
        instrumentation,
        style,
        optimizationLevel,
        targetPlatforms,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error rewriting prompt:', error);

    // Log the failed generation
    await aiGenerationsCollection.insertOne({
      userId: req.userId,
      type: 'prompt_rewrite',
      input: req.body,
      output: null,
      model: 'gemini-pro',
      timestamp: new Date(),
      success: false,
      error: error.message
    });

    // Fallback enhancement
    const { basePrompt, genre, mood } = req.body;
    const fallbackPrompt = `Enhanced ${genre} track with ${mood} atmosphere. Detailed instrumentation including piano, strings, and subtle electronic elements. Professional production with emotional depth and dynamic range. Perfect for ${req.body.targetPlatforms?.join(', ') || 'AI music generation'} platforms.`;

    res.json({
      success: true,
      refinedPrompt: fallbackPrompt,
      metadata: {
        genre,
        mood,
        tempo: req.body.tempo,
        instrumentation: req.body.instrumentation,
        style: req.body.style,
        optimizationLevel: req.body.optimizationLevel,
        targetPlatforms: req.body.targetPlatforms,
        timestamp: new Date().toISOString(),
        fallback: true
      }
    });
  }
});

// POST /api/prompts - Create a new prompt
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      basePrompt,
      refinedPrompt,
      genre,
      mood,
      tempo,
      instrumentation,
      style,
      optimizationLevel,
      targetPlatforms,
      tags,
      collectionId
    } = req.body;

    const { userId } = req;

    // Validate required fields
    if (!title || !basePrompt || !refinedPrompt) {
      return res.status(400).json({ error: 'Title, base prompt, and refined prompt are required' });
    }

    // Insert prompt into database
    const result = await postgresPool.query(`
      INSERT INTO prompts (
        user_id,
        collection_id,
        title,
        base_prompt,
        refined_prompt,
        genre,
        mood,
        tempo,
        instrumentation,
        style,
        optimization_level,
        target_platforms,
        tags,
        version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 1)
      RETURNING *
    `, [
      userId,
      collectionId,
      title,
      basePrompt,
      refinedPrompt,
      genre,
      mood,
      tempo,
      instrumentation,
      style,
      optimizationLevel,
      targetPlatforms,
      tags
    ]);

    const prompt = result.rows[0];

    // Log the creation
    await aiGenerationsCollection.insertOne({
      userId,
      type: 'prompt_creation',
      input: { title, basePrompt, genre, mood },
      output: { promptId: prompt.id },
      model: 'manual',
      timestamp: new Date(),
      success: true
    });

    res.status(201).json({
      success: true,
      prompt
    });

  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

// GET /api/prompts - Get user's prompts
router.get('/', authenticate, async (req, res) => {
  try {
    const { userId } = req;
    const { 
      page = 1, 
      limit = 20, 
      genre, 
      mood, 
      optimizationLevel, 
      search,
      collectionId,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build query
    let query = `
      SELECT p.*, pc.name as collection_name, COUNT(pl.id) as like_count
      FROM prompts p
      LEFT JOIN prompt_collections pc ON p.collection_id = pc.id
      LEFT JOIN prompt_likes pl ON p.id = pl.prompt_id
    `;

    const queryParams = [userId];
    const paramIndex = 2;

    // Add filters
    query += ' WHERE p.user_id = $1';

    if (genre) {
      query += ` AND p.genre = $${paramIndex}`;
      queryParams.push(genre);
      paramIndex++;
    }

    if (mood) {
      query += ` AND p.mood = $${paramIndex}`;
      queryParams.push(mood);
      paramIndex++;
    }

    if (optimizationLevel) {
      query += ` AND p.optimization_level = $${paramIndex}`;
      queryParams.push(optimizationLevel);
      paramIndex++;
    }

    if (search) {
      query += ` AND (p.title ILIKE $${paramIndex} OR p.base_prompt ILIKE $${paramIndex} OR p.refined_prompt ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (collectionId) {
      query += ` AND p.collection_id = $${paramIndex}`;
      queryParams.push(collectionId);
      paramIndex++;
    }

    // Add sorting
    const validSortColumns = ['created_at', 'updated_at', 'effectiveness_score', 'like_count', 'title'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY p.${sortColumn} ${sortDirection}`;

    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    // Execute query
    const result = await postgresPool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM prompts p
      WHERE p.user_id = $1
    `;

    const countParams = [userId];
    const countParamIndex = 2;

    if (genre) {
      countQuery += ` AND p.genre = $${countParamIndex}`;
      countParams.push(genre);
      countParamIndex++;
    }

    if (mood) {
      countQuery += ` AND p.mood = $${countParamIndex}`;
      countParams.push(mood);
      countParamIndex++;
    }

    if (optimizationLevel) {
      countQuery += ` AND p.optimization_level = $${countParamIndex}`;
      countParams.push(optimizationLevel);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (p.title ILIKE $${countParamIndex} OR p.base_prompt ILIKE $${countParamIndex} OR p.refined_prompt ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (collectionId) {
      countQuery += ` AND p.collection_id = $${countParamIndex}`;
      countParams.push(collectionId);
      countParamIndex++;
    }

    const countResult = await postgresPool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      prompts: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// GET /api/prompts/:id - Get a specific prompt
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const result = await postgresPool.query(`
      SELECT p.*, pc.name as collection_name, 
             COUNT(pl.id) as like_count,
             COALESCE(json_agg(DISTINCT pt.name) FILTER (WHERE pt.id IS NOT NULL), '{}') as related_templates
      FROM prompts p
      LEFT JOIN prompt_collections pc ON p.collection_id = pc.id
      LEFT JOIN prompt_likes pl ON p.id = pl.prompt_id
      LEFT JOIN prompt_templates pt ON pt.genre = p.genre OR pt.mood = p.mood
      WHERE p.id = $1 AND (p.user_id = $2 OR p.is_public = true)
      GROUP BY p.id, pc.name
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    const prompt = result.rows[0];

    // Get versions
    const versionsResult = await postgresPool.query(`
      SELECT id, version_number, created_at, changelog
      FROM prompt_versions
      WHERE prompt_id = $1
      ORDER BY version_number DESC
    `, [id]);

    prompt.versions = versionsResult.rows;

    res.json({
      success: true,
      prompt
    });

  } catch (error) {
    console.error('Error fetching prompt:', error);
    res.status(500).json({ error: 'Failed to fetch prompt' });
  }
});

// PUT /api/prompts/:id - Update a prompt
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const {
      title,
      basePrompt,
      refinedPrompt,
      genre,
      mood,
      tempo,
      instrumentation,
      style,
      optimizationLevel,
      targetPlatforms,
      tags,
      isFavorite,
      isPublic
    } = req.body;

    // Check if user owns the prompt
    const ownershipCheck = await postgresPool.query(
      'SELECT id FROM prompts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have permission to update this prompt' });
    }

    // Update prompt
    const result = await postgresPool.query(`
      UPDATE prompts SET
        title = $1,
        base_prompt = $2,
        refined_prompt = $3,
        genre = $4,
        mood = $5,
        tempo = $6,
        instrumentation = $7,
        style = $8,
        optimization_level = $9,
        target_platforms = $10,
        tags = $11,
        is_favorite = $12,
        is_public = $13,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14 AND user_id = $15
      RETURNING *
    `, [
      title,
      basePrompt,
      refinedPrompt,
      genre,
      mood,
      tempo,
      instrumentation,
      style,
      optimizationLevel,
      targetPlatforms,
      tags,
      isFavorite,
      isPublic,
      id,
      userId
    ]);

    const prompt = result.rows[0];

    // Log the update
    await aiGenerationsCollection.insertOne({
      userId,
      type: 'prompt_update',
      input: { promptId: id, updates: req.body },
      output: { promptId: prompt.id },
      model: 'manual',
      timestamp: new Date(),
      success: true
    });

    res.json({
      success: true,
      prompt
    });

  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({ error: 'Failed to update prompt' });
  }
});

// DELETE /api/prompts/:id - Delete a prompt
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    // Check if user owns the prompt
    const ownershipCheck = await postgresPool.query(
      'SELECT id FROM prompts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You do not have permission to delete this prompt' });
    }

    // Delete prompt (cascade will handle related records)
    await postgresPool.query('DELETE FROM prompts WHERE id = $1 AND user_id = $2', [id, userId]);

    // Log the deletion
    await aiGenerationsCollection.insertOne({
      userId,
      type: 'prompt_deletion',
      input: { promptId: id },
      output: { deleted: true },
      model: 'manual',
      timestamp: new Date(),
      success: true
    });

    res.status(204).send();

  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

// POST /api/prompts/:id/like - Like/unlike a prompt
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    // Check if prompt exists
    const promptCheck = await postgresPool.query('SELECT id FROM prompts WHERE id = $1', [id]);
    if (promptCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Check if already liked
    const likeCheck = await postgresPool.query(
      'SELECT id FROM prompt_likes WHERE prompt_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (likeCheck.rows.length > 0) {
      // Unlike
      await postgresPool.query(
        'DELETE FROM prompt_likes WHERE prompt_id = $1 AND user_id = $2',
        [id, userId]
      );
      res.json({ success: true, liked: false });
    } else {
      // Like
      await postgresPool.query(
        'INSERT INTO prompt_likes (prompt_id, user_id) VALUES ($1, $2)',
        [id, userId]
      );
      res.json({ success: true, liked: true });
    }

  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// POST /api/prompts/:id/export - Export a prompt for a specific platform
router.post('/:id/export', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { platform, format = 'text' } = req.body;

    // Check if user has access to the prompt
    const accessCheck = await postgresPool.query(`
      SELECT p.* 
      FROM prompts p
      WHERE p.id = $1 AND (p.user_id = $2 OR p.is_public = true)
    `, [id, userId]);

    if (accessCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Prompt not found or access denied' });
    }

    const prompt = accessCheck.rows[0];

    // Generate platform-specific export
    let exportedContent = '';
    let platformData = {};

    switch (platform) {
      case 'suno':
        exportedContent = generateSunoExport(prompt);
        platformData = {
          sections: extractSections(prompt.refined_prompt),
          style: prompt.style,
          mood: prompt.mood,
          genre: prompt.genre
        };
        break;
      case 'udio':
        exportedContent = generateUdioExport(prompt);
        platformData = {
          instruments: extractInstruments(prompt.refined_prompt),
            mood: prompt.mood,
            genre: prompt.genre,
            tempo: prompt.tempo
        };
        break;
      case 'stable-audio':
        exportedContent = generateStableAudioExport(prompt);
        platformData = {
          duration: '2:00', // Default duration
          style: prompt.style,
          mood: prompt.mood,
          genre: prompt.genre
        };
        break;
      default:
        exportedContent = prompt.refined_prompt;
        platformData = { raw: true };
    }

    // Log the export
    await aiGenerationsCollection.insertOne({
      userId,
      type: 'prompt_export',
      input: { promptId: id, platform, format },
      output: { exported: true },
      model: 'manual',
      timestamp: new Date(),
      success: true
    });

    res.json({
      success: true,
      exportedContent,
      platform,
      format,
      platformData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error exporting prompt:', error);
    res.status(500).json({ error: 'Failed to export prompt' });
  }
});

// Helper functions for platform-specific exports
function generateSunoExport(prompt) {
  const sections = extractSections(prompt.refined_prompt);
  return `
Suno AI Prompt:
Genre: ${prompt.genre}
Mood: ${prompt.mood}
Tempo: ${prompt.tempo || '120'}

Style: ${prompt.style || 'Modern'}

Prompt: ${prompt.refined_prompt}

Sections: ${sections.join(', ')}

Instrumentation: ${prompt.instrumentation ? prompt.instrumentation.join(', ') : 'Various'}

Emotional Arc: ${extractEmotionalArc(prompt.refined_prompt)}

Production Quality: Professional studio quality
  `.trim();
}

function generateUdioExport(prompt) {
  return `
Udio AI Prompt:
Title: ${prompt.title}
Genre: ${prompt.genre}
Mood: ${prompt.mood}
Tempo: ${prompt.tempo || '120'}

Style: ${prompt.style || 'Contemporary'}

Main Instruments: ${extractInstruments(prompt.refined_prompt).join(', ')}

Prompt: ${prompt.refined_prompt}

Structure: ${extractStructure(prompt.refined_prompt)}

Vocal Style: ${extractVocalStyle(prompt.refined_prompt)}

Production Notes: ${extractProductionNotes(prompt.refined_prompt)}
  `.trim();
}

function generateStableAudioExport(prompt) {
  return `
Stable Audio Prompt:
Title: ${prompt.title}
Genre: ${prompt.genre}
Mood: ${prompt.mood}
Duration: 2:00 (default)

Style: ${prompt.style || 'Professional'}

Prompt: ${prompt.refined_prompt}

Key Elements: ${extractKeyElements(prompt.refined_prompt).join(', ')}

Atmosphere: ${extractAtmosphere(prompt.refined_prompt)}

Production Quality: High fidelity
  `.trim();
}

// Section extraction helpers
function extractSections(text) {
  const sectionKeywords = ['verse', 'chorus', 'bridge', 'intro', 'outro', 'pre-chorus', 'breakdown'];
  const foundSections = [];
  
  sectionKeywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword)) {
      foundSections.push(keyword);
    }
  });
  
  return foundSections.length > 0 ? foundSections : ['verse', 'chorus', 'bridge'];
}

function extractInstruments(text) {
  const instrumentKeywords = ['piano', 'guitar', 'drums', 'bass', 'strings', 'synth', 'violin', 'cello', 'trumpet', 'saxophone', 'flute', 'clarinet'];
  const foundInstruments = [];
  
  instrumentKeywords.forEach(instrument => {
    if (text.toLowerCase().includes(instrument)) {
      foundInstruments.push(instrument);
    }
  });
  
  return foundInstruments.length > 0 ? foundInstruments : ['piano', 'strings', 'synth'];
}

function extractEmotionalArc(text) {
  if (text.toLowerCase().includes('build')) return 'Building intensity';
  if (text.toLowerCase().includes('calm')) return 'Calm to energetic';
  if (text.toLowerCase().includes('emotional')) return 'Emotional journey';
  return 'Consistent mood';
}

function extractVocalStyle(text) {
  if (text.toLowerCase().includes('vocal') || text.toLowerCase().includes('sing')) {
    if (text.toLowerCase().includes('male')) return 'Male vocal';
    if (text.toLowerCase().includes('female')) return 'Female vocal';
    if (text.toLowerCase().includes('choir')) return 'Choir';
    return 'Vocal';
  }
  return 'Instrumental';
}

function extractStructure(text) {
  if (text.toLowerCase().includes('verse') && text.toLowerCase().includes('chorus')) {
    return 'Verse-Chorus structure';
  }
  if (text.toLowerCase().includes('intro') && text.toLowerCase().includes('outro')) {
    return 'Intro-Body-Outro structure';
  }
  return 'Free form';
}

function extractProductionNotes(text) {
  if (text.toLowerCase().includes('reverb')) return 'Reverb-heavy';
  if (text.toLowerCase().includes('delay')) return 'Delay effects';
  if (text.toLowerCase().includes('distortion')) return 'Distorted elements';
  return 'Clean production';
}

function extractKeyElements(text) {
  const elements = [];
  if (text.toLowerCase().includes('melody')) elements.push('Strong melody');
  if (text.toLowerCase().includes('rhythm')) elements.push 'Driving rhythm';
  if (text.toLowerCase().includes('harmony')) elements.push('Rich harmony');
  if (text.toLowerCase().includes('atmosphere')) elements.push('Atmospheric');
  return elements.length > 0 ? elements : ['Musical elements'];
}

function extractAtmosphere(text) {
  if (text.toLowerCase().includes('dark')) return 'Dark and moody';
  if (text.toLowerCase().includes('light')) return 'Light and airy';
  if (text.toLowerCase().includes('warm')) return 'Warm and inviting';
  if (text.toLowerCase().includes('cold')) return 'Cold and distant';
  return 'Neutral atmosphere';
}

module.exports = router;