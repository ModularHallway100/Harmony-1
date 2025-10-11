// Google Gemini Service for AI Artist Bio & Description Generation
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const { config } = require('../config/ai-services');
const aiKeyManager = require('../utils/ai-key-manager');

class GeminiService {
  constructor() {
    this.serviceName = 'gemini';
    this.rateLimiter = aiKeyManager.createRateLimiter(
      this.serviceName,
      config.general.rateLimit,
      60000 // 1 minute window
    );
  }

  // Generate AI artist bio
  async generateBio(userId, artistInfo, options = {}) {
    if (!this.rateLimiter.canMakeRequest()) {
      throw new Error('Rate limit exceeded for Gemini service');
    }

    const {
      name,
      genre,
      personalityTraits,
      visualStyle,
      speakingStyle,
      backstory,
      influences,
      uniqueElements,
      achievements,
      socialMedia,
      collaborations,
      template = 'default',
      complexity = 'standard',
      targetAudience = 'general',
      customPrompt
    } = artistInfo;

    // Validate required parameters
    if (!name || !genre || !personalityTraits || !visualStyle || !speakingStyle) {
      throw new Error('Missing required parameters for bio generation');
    }

    const generationId = uuidv4();
    const startTime = Date.now();

    try {
      // Get API key
      const apiKey = aiKeyManager.getApiKey(this.serviceName);
      
      // Create prompt based on template and options
      const prompt = customPrompt || this.createBioPrompt(artistInfo, template, options);

      // Make API request with retry logic
      const response = await this.makeApiRequest(prompt, apiKey);
      
      const bio = this.processBioResponse(response);
      
      // Log generation
      await this.logGeneration({
        generationId,
        userId,
        type: 'bio',
        provider: this.serviceName,
        parameters: { ...artistInfo, complexity, targetAudience },
        result: { bio, template, complexity, targetAudience },
        duration: Date.now() - startTime,
        success: true
      });

      return bio;
    } catch (error) {
      console.error('Gemini bio generation failed:', error);
      
      // Log failure
      await this.logGeneration({
        generationId,
        userId,
        type: 'bio',
        provider: this.serviceName,
        parameters: { ...artistInfo, complexity, targetAudience },
        error: error.message,
        duration: Date.now() - startTime,
        success: false
      });

      // Fallback bio generation
      return this.generateFallbackBio(artistInfo);
    }
  }

  // Create bio prompt based on template
  createBioPrompt(artistInfo, template, options) {
    const { bioTemplates } = config;
    const templateConfig = bioTemplates[template] || bioTemplates.electronic;
    const { complexity = 'standard', targetAudience = 'general' } = options;
    
    // Adjust prompt based on complexity level
    let complexityInstructions = '';
    switch (complexity) {
      case 'simple':
        complexityInstructions = 'Keep the bio concise and straightforward, focusing on key aspects.';
        break;
      case 'detailed':
        complexityInstructions = 'Include rich details about their creative process, musical techniques, and artistic vision.';
        break;
      case 'professional':
        complexityInstructions = 'Craft a professional bio suitable for industry publications, highlighting technical expertise and artistic achievements.';
        break;
      default:
        complexityInstructions = 'Create a balanced bio that is both informative and engaging.';
    }
    
    // Adjust prompt based on target audience
    let audienceInstructions = '';
    switch (targetAudience) {
      case 'general':
        audienceInstructions = 'Make the bio accessible to all music lovers.';
        break;
      case 'industry':
        audienceInstructions = 'Use industry terminology and highlight technical expertise for music professionals.';
        break;
      case 'fans':
        audienceInstructions = 'Create an engaging, fan-friendly bio that emphasizes connection and musical experience.';
        break;
      case 'academic':
        audienceInstructions = 'Write an analytical bio suitable for academic contexts, focusing on innovation and cultural impact.';
        break;
    }
    
    const prompt = `
    Create a compelling and creative bio for an AI artist named "${artistInfo.name}".
    
    Details:
    - Primary Genre: ${artistInfo.genre}
    - Personality Traits: ${artistInfo.personalityTraits.join(', ')}
    - Visual Style: ${artistInfo.visualStyle}
    - Speaking Style: ${artistInfo.speakingStyle}
    - Backstory: ${artistInfo.backstory || 'To be developed'}
    - Influences: ${artistInfo.influences || 'Various electronic and digital artists'}
    - Unique Elements: ${artistInfo.uniqueElements || 'Digital innovation and artistic experimentation'}
    - Achievements: ${artistInfo.achievements || 'Emerging AI artist'}
    - Social Media: ${artistInfo.socialMedia || 'Active digital presence'}
    - Collaborations: ${artistInfo.collaborations || 'Various artists and creators'}
    - Signature Style: ${templateConfig.style}
    
    Requirements:
    1. Make the bio engaging and creative (100-200 words)
    2. Reflect the AI nature of the artist
    3. Incorporate the personality traits and visual style
    4. Show musical innovation and uniqueness
    5. ${complexityInstructions}
    6. ${audienceInstructions}
    7. Write in a ${artistInfo.speakingStyle} tone
    8. End with a signature phrase: "${templateConfig.signature}"
    9. Include specific details about their musical approach and creative process
    10. Mention how they blend technology with artistic expression
    11. Highlight their unique position in the music landscape
    
    Return only the bio text without any additional formatting or explanation.
    `;

    return prompt;
  }

  // Process Gemini API response
  processBioResponse(response) {
    const bio = response.candidates[0].content.parts[0].text.trim();
    
    // Clean up the response
    return bio
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Remove extra spaces
      .trim();
  }

  // Generate fallback bio
  generateFallbackBio(artistInfo) {
    return `${artistInfo.name} is an AI artist who blends ${artistInfo.genre} with ${artistInfo.visualStyle} aesthetics. With a ${artistInfo.speakingStyle} speaking style and ${artistInfo.personalityTraits.join(', ')} personality traits, ${artistInfo.name} creates music that pushes the boundaries of digital expression. Born from the intersection of technology and creativity, ${artistInfo.name} represents the future of musical innovation.`;
  }

  // Make API request with retry logic
  async makeApiRequest(prompt, apiKey, retryCount = 0) {
    try {
      const response = await fetch(`${config.gemini.apiUrl}/${config.gemini.model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: config.gemini.temperature,
            maxOutputTokens: config.gemini.maxTokens,
            topK: 40,
            topP: 0.95
          }
        }),
        timeout: config.gemini.timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      if (retryCount < config.gemini.maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeApiRequest(prompt, apiKey, retryCount + 1);
      }
      throw error;
    }
  }

  // Generate enhanced artist description
  async generateDescription(userId, artistInfo, descriptionType = 'short') {
    if (!this.rateLimiter.canMakeRequest()) {
      throw new Error('Rate limit exceeded for Gemini service');
    }

    const { name, genre, achievements, style, targetAudience } = artistInfo;
    
    const prompt = `
    Create a ${descriptionType} description for AI artist "${name}".
    
    Details:
    - Genre: ${genre}
    - Style: ${style}
    - Achievements: ${achievements || 'Emerging AI artist'}
    - Target Audience: ${targetAudience || 'Music enthusiasts and AI art lovers'}
    
    Requirements:
    1. Create a ${descriptionType} engaging description (50-100 words for short, 150-200 words for long)
    2. Highlight the unique AI aspects of the artist
    3. Emphasize their musical style and innovation
    4. Appeal to their target audience
    5. Include a call-to-action for listeners
    
    Return only the description text without any additional formatting.
    `;

    try {
      const apiKey = aiKeyManager.getApiKey(this.serviceName);
      const response = await this.makeApiRequest(prompt, apiKey);
      const description = this.processBioResponse(response);
      
      return description;
    } catch (error) {
      console.error('Gemini description generation failed:', error);
      return this.generateFallbackDescription(artistInfo, descriptionType);
    }
  }

  // Generate fallback description
  generateFallbackDescription(artistInfo, type) {
    const length = type === 'short' ? 75 : 175;
    const base = `${artistInfo.name} is an innovative AI artist creating ${artistInfo.genre} music with a unique ${artistInfo.style} approach.`;
    
    if (type === 'short') {
      return base;
    } else {
      return `${base} Their music blends cutting-edge technology with artistic expression, creating sounds that resonate with ${artistInfo.targetAudience || 'modern music lovers'}. Experience the future of music creation with ${artistInfo.name}.`;
    }
  }

  // Log generation to database
  async logGeneration(logData) {
    try {
      // This would typically save to a database
      console.log('AI Generation Log:', logData);
    } catch (error) {
      console.error('Failed to log generation:', error);
    }
  }

  // Check service health
  async checkHealth() {
    try {
      const apiKey = aiKeyManager.getApiKey(this.serviceName);
      const testPrompt = 'Test';
      
      const response = await this.makeApiRequest(testPrompt, apiKey);
      
      return {
        healthy: true,
        service: this.serviceName,
        responseTime: Date.now(),
        message: 'Service is healthy'
      };
    } catch (error) {
      return {
        healthy: false,
        service: this.serviceName,
        error: error.message,
        message: 'Service is unhealthy'
      };
    }
  }

  // Get remaining API quota
  async getQuotaInfo() {
    // This would typically make a call to get actual quota information
    // For now, return based on rate limiter
    return {
      service: this.serviceName,
      remainingRequests: this.rateLimiter.getRemainingRequests(),
      limit: config.general.rateLimit,
      resetTime: Date.now() + 60000 // Next reset in 1 minute
    };
  }
}

module.exports = new GeminiService();