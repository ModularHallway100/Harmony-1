// Seedance Service for AI Image Generation
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const { config } = require('../config/ai-services');
const aiKeyManager = require('../utils/ai-key-manager');

class SeedanceService {
  constructor() {
    this.serviceName = 'seedance';
    this.rateLimiter = aiKeyManager.createRateLimiter(
      this.serviceName,
      config.general.rateLimit,
      60000 // 1 minute window
    );
    this.imageCache = new Map();
  }

  // Generate AI artist image
  async generateImage(userId, imageRequest, options = {}) {
    if (!this.rateLimiter.canMakeRequest()) {
      throw new Error('Rate limit exceeded for Seedance service');
    }

    const {
      name,
      visualStyle,
      genre,
      personalityTraits,
      prompt,
      size = config.seedance.defaultSize,
      model = config.seedance.model,
      quality = config.seedance.quality
    } = imageRequest;

    // Validate required parameters
    if (!name || !visualStyle) {
      throw new Error('Missing required parameters for image generation');
    }

    const generationId = uuidv4();
    const startTime = Date.now();

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(imageRequest, options);
      const cachedImage = this.imageCache.get(cacheKey);
      
      if (cachedImage && Date.now() - cachedImage.timestamp < config.general.cacheTTL) {
        await this.logGeneration({
          generationId,
          userId,
          type: 'image',
          provider: this.serviceName,
          parameters: imageRequest,
          result: { imageUrl: cachedImage.url },
          duration: Date.now() - startTime,
          success: true,
          cached: true
        });
        return cachedImage.url;
      }

      // Get API key
      const apiKey = aiKeyManager.getApiKey(this.serviceName);
      
      // Create prompt if not provided
      const finalPrompt = prompt || this.createImagePrompt(imageRequest);
      
      // Make API request with retry logic
      const imageUrl = await this.makeApiRequest(finalPrompt, apiKey, {
        size,
        model,
        quality
      });
      
      // Cache the result
      this.imageCache.set(cacheKey, {
        url: imageUrl,
        timestamp: Date.now()
      });
      
      // Log generation
      await this.logGeneration({
        generationId,
        userId,
        type: 'image',
        provider: this.serviceName,
        parameters: imageRequest,
        result: { imageUrl },
        duration: Date.now() - startTime,
        success: true
      });

      return imageUrl;
    } catch (error) {
      console.error('Seedance image generation failed:', error);
      
      // Log failure
      await this.logGeneration({
        generationId,
        userId,
        type: 'image',
        provider: this.serviceName,
        parameters: imageRequest,
        error: error.message,
        duration: Date.now() - startTime,
        success: false
      });

      // Fallback image URL
      return this.generateFallbackImage(name, visualStyle);
    }
  }

  // Create image prompt
  createImagePrompt(imageRequest) {
    const { name, visualStyle, genre, personalityTraits } = imageRequest;
    const { imageTemplates } = config;

    const styleTemplate = imageTemplates.artistProfile.styles[genre] || imageTemplates.artistProfile.styles.electronic;
    
    const prompt = `
    Professional profile picture for AI artist "${name}" creating ${genre} music.
    
    Style: ${visualStyle} with ${styleTemplate}
    Personality: ${personalityTraits ? personalityTraits.join(', ') : 'innovative and creative'}
    
    Requirements:
    - Digital/AI aesthetic with artistic elements
    - Visible and expressive face
    - Complementary background
    - Professional appearance
    - High quality artistic portrait
    
    Create a unique, memorable portrait capturing the essence of this AI artist.
    `;

    return prompt.trim();
  }

  // Generate cache key
  generateCacheKey(imageRequest, options) {
    const { name, visualStyle, genre, prompt } = imageRequest;
    const { size, model, quality } = options;
    
    return `${name}-${visualStyle}-${genre}-${prompt || 'auto'}-${size}-${model}-${quality}`;
  }

  // Make API request with retry logic
  async makeApiRequest(prompt, apiKey, options = {}) {
    try {
      const { size = config.seedance.defaultSize, model = config.seedance.model, quality = config.seedance.quality } = options;
      
      const response = await fetch(config.seedance.apiUrl + '/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          prompt,
          size,
          quality
        }),
        timeout: config.seedance.timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Seedance API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      if (!data.data || !data.data[0] || !data.data[0].url) {
        throw new Error('No image URL returned from Seedance API');
      }

      return data.data[0].url;
    } catch (error) {
      if (error.message.includes('Rate limit') || error.message.includes('Too many requests')) {
        // Wait longer for rate limit errors
        const delay = 60000; // 1 minute
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeApiRequest(prompt, apiKey, options);
      }
      
      throw error;
    }
  }

  // Generate fallback image URL
  generateFallbackImage(name, visualStyle) {
    const seed = `${name}-${visualStyle}-${Date.now()}`;
    return `https://picsum.photos/seed/${seed}/512/512`;
  }

  // Generate multiple image variations
  async generateImageVariations(userId, baseImageRequest, variationCount = 3) {
    if (!this.rateLimiter.canMakeRequest()) {
      throw new Error('Rate limit exceeded for Seedance service');
    }

    const variations = [];
    
    for (let i = 0; i < variationCount; i++) {
      try {
        // Add variation to prompt
        const variedRequest = {
          ...baseImageRequest,
          prompt: `${baseImageRequest.prompt || this.createImagePrompt(baseImageRequest)} variation ${i + 1}`
        };
        
        const imageUrl = await this.generateImage(userId, variedRequest);
        variations.push(imageUrl);
      } catch (error) {
        console.error(`Failed to generate variation ${i + 1}:`, error);
        variations.push(this.generateFallbackImage(baseImageRequest.name, baseImageRequest.visualStyle));
      }
    }

    return variations;
  }

  // Optimize image prompt for better results
  optimizePrompt(basePrompt, style, quality = 'high') {
    const qualityModifiers = {
      low: 'standard quality',
      medium: 'high quality detailed',
      high: 'ultra high quality photorealistic'
    };

    const styleModifiers = {
      electronic: 'futuristic digital aesthetic neon colors cyberpunk elements',
      hip_hop: 'urban street style bold colors modern fashion',
      classical: 'elegant timeless portrait classical art style sophisticated',
      jazz: 'smooth sophisticated vibe warm colors artistic expression',
      rock: 'edgy rockstar appearance dynamic pose electric energy',
      pop: 'bright colorful style modern pop art engaging expression'
    };

    return `
    ${basePrompt}
    Style: ${styleModifiers[style] || style}
    Quality: ${qualityModifiers[quality]}
    Professional portrait studio lighting cinematic composition
    `;
  }

  // Generate image with specific artistic style
  async generateWithArtisticStyle(userId, imageRequest, artisticStyle) {
    const enhancedRequest = {
      ...imageRequest,
      prompt: `${imageRequest.prompt || this.createImagePrompt(imageRequest)} in ${artisticStyle} style`
    };

    return await this.generateImage(userId, enhancedRequest);
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
      const testPrompt = 'Test image';
      
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
    return {
      service: this.serviceName,
      remainingRequests: this.rateLimiter.getRemainingRequests(),
      limit: config.general.rateLimit,
      resetTime: Date.now() + 60000, // Next reset in 1 minute
      cachedImages: this.imageCache.size
    };
  }

  // Clear image cache
  clearCache() {
    this.imageCache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;

    for (const [key, entry] of this.imageCache) {
      if (now - entry.timestamp < config.general.cacheTTL) {
        activeEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.imageCache.size,
      activeEntries,
      expiredEntries,
      cacheTTL: config.general.cacheTTL
    };
  }
}

module.exports = new SeedanceService();