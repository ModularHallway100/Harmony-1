// OpenAI Service for Music Prompt Rewriting and Enhancement
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const { config } = require('../config/ai-services');
const aiKeyManager = require('../utils/ai-key-manager');

class OpenAIService {
  constructor() {
    this.serviceName = 'openai';
    this.rateLimiter = aiKeyManager.createRateLimiter(
      this.serviceName,
      config.general.rateLimit,
      60000 // 1 minute window
    );
    this.promptCache = new Map();
  }

  // Rewrite and optimize music prompt
  async rewritePrompt(userId, promptRequest, options = {}) {
    if (!this.rateLimiter.canMakeRequest()) {
      throw new Error('Rate limit exceeded for OpenAI service');
    }

    const {
      originalPrompt,
      genre,
      mood,
      style,
      targetPlatform,
      complexity = 'medium',
      length = 'medium'
    } = promptRequest;

    // Validate required parameters
    if (!originalPrompt) {
      throw new Error('Original prompt is required for rewriting');
    }

    const generationId = uuidv4();
    const startTime = Date.now();

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(promptRequest, options);
      const cachedResult = this.promptCache.get(cacheKey);
      
      if (cachedResult && Date.now() - cachedResult.timestamp < config.general.cacheTTL) {
        await this.logGeneration({
          generationId,
          userId,
          type: 'prompt_rewrite',
          provider: this.serviceName,
          parameters: promptRequest,
          result: { rewrittenPrompt: cachedResult.prompt, analysis: cachedResult.analysis },
          duration: Date.now() - startTime,
          success: true,
          cached: true
        });
        return {
          rewrittenPrompt: cachedResult.prompt,
          analysis: cachedResult.analysis,
          improvements: cachedResult.improvements
        };
      }

      // Get API key
      const apiKey = aiKeyManager.getApiKey(this.serviceName);
      
      // Create rewrite prompt
      const rewritePrompt = this.createRewritePrompt(promptRequest, options);
      
      // Make API request with retry logic
      const result = await this.makeApiRequest(rewritePrompt, apiKey, options);
      
      // Cache the result
      this.promptCache.set(cacheKey, {
        prompt: result.rewrittenPrompt,
        analysis: result.analysis,
        improvements: result.improvements,
        timestamp: Date.now()
      });
      
      // Log generation
      await this.logGeneration({
        generationId,
        userId,
        type: 'prompt_rewrite',
        provider: this.serviceName,
        parameters: promptRequest,
        result,
        duration: Date.now() - startTime,
        success: true
      });

      return result;
    } catch (error) {
      console.error('OpenAI prompt rewriting failed:', error);
      
      // Log failure
      await this.logGeneration({
        generationId,
        userId,
        type: 'prompt_rewrite',
        provider: this.serviceName,
        parameters: promptRequest,
        error: error.message,
        duration: Date.now() - startTime,
        success: false
      });

      // Fallback prompt enhancement
      return this.generateFallbackRewrite(promptRequest);
    }
  }

  // Create rewrite prompt
  createRewritePrompt(promptRequest, options) {
    const { originalPrompt, genre, mood, style, targetPlatform, complexity, length } = promptRequest;
    
    const lengthGuidance = {
      short: '50-100 words',
      medium: '100-200 words',
      long: '200-300 words'
    };

    const complexityGuidance = {
      simple: 'clear and straightforward language',
      medium: 'detailed descriptive language with some technical terms',
      advanced: 'highly technical and descriptive language with specific musical terminology'
    };

    return `
    You are an expert AI music prompt engineer. Rewrite and enhance the following music generation prompt to make it more effective and detailed for ${targetPlatform || 'AI music generation'}.

    Original Prompt: "${originalPrompt}"

    Enhancement Requirements:
    - Genre: ${genre || 'unspecified'}
    - Mood/Emotion: ${mood || 'unspecified'}
    - Musical Style: ${style || 'unspecified'}
    - Complexity Level: ${complexity}
    - Target Length: ${lengthGuidance[length]}
    - Language Style: ${complexityGuidance[complexity]}

    Please provide:
    1. Rewritten Prompt: A significantly enhanced version of the original prompt that incorporates genre-specific elements, mood descriptions, and stylistic details.
    2. Analysis: Brief analysis of what was improved and why (2-3 sentences).
    3. Key Improvements: List 3-5 specific improvements made to the prompt.

    Format your response as JSON:
    {
      "rewrittenPrompt": "enhanced prompt text",
      "analysis": "analysis of improvements",
      "improvements": ["improvement 1", "improvement 2", "improvement 3"]
    }

    Ensure the rewritten prompt is:
    - More descriptive and specific
    - Includes relevant genre conventions
    - Captures the desired mood and emotion
    - Appropriate for the target platform
    - Optimized for AI music generation
    `;
  }

  // Generate fallback rewrite
  generateFallbackRewrite(promptRequest) {
    const { originalPrompt, genre, mood, style } = promptRequest;
    
    const enhancedPrompt = `
    Enhanced ${genre} music generation prompt with ${mood} mood and ${style} style.
    ${originalPrompt}
    
    Additional details: professional production quality, dynamic range, rich harmonies, 
    innovative sound design, and engaging musical structure.
    `.trim();

    return {
      rewrittenPrompt: enhancedPrompt,
      analysis: 'Basic enhancement with genre, mood, and style elements',
      improvements: [
        'Added genre-specific terminology',
        'Incorporated mood descriptions',
        'Enhanced with production quality details'
      ]
    };
  }

  // Analyze prompt quality
  async analyzePrompt(userId, prompt, options = {}) {
    if (!this.rateLimiter.canMakeRequest()) {
      throw new Error('Rate limit exceeded for OpenAI service');
    }

    const generationId = uuidv4();
    const startTime = Date.now();

    try {
      const apiKey = aiKeyManager.getApiKey(this.serviceName);
      
      const analysisPrompt = `
      Analyze the following music generation prompt for quality and effectiveness:
      
      Prompt: "${prompt}"
      
      Please provide a comprehensive analysis including:
      1. Overall Quality Score (1-10)
      2. Strengths (3-5 bullet points)
      3. Weaknesses (3-5 bullet points)
      4. Specific Recommendations for improvement
      5. Estimated effectiveness for different AI music platforms
      
      Format your response as JSON:
      {
        "qualityScore": 8,
        "strengths": ["clear direction", "specific elements"],
        "weaknesses": ["lacks emotional depth", "too generic"],
        "recommendations": ["add more emotional descriptors", "specify instrumentation"],
        "platformEffectiveness": {
          "suno": "high",
          "udio": "medium",
          "stability": "low"
        }
      }
      `;

      const response = await this.makeApiRequest(analysisPrompt, apiKey, options);
      
      await this.logGeneration({
        generationId,
        userId,
        type: 'prompt_analysis',
        provider: this.serviceName,
        parameters: { prompt },
        result: response,
        duration: Date.now() - startTime,
        success: true
      });

      return response;
    } catch (error) {
      console.error('OpenAI prompt analysis failed:', error);
      
      await this.logGeneration({
        generationId,
        userId,
        type: 'prompt_analysis',
        provider: this.serviceName,
        parameters: { prompt },
        error: error.message,
        duration: Date.now() - startTime,
        success: false
      });

      return this.generateFallbackAnalysis(prompt);
    }
  }

  // Generate fallback analysis
  generateFallbackAnalysis(prompt) {
    const length = prompt.length;
    const hasGenre = prompt.toLowerCase().includes('rock') || prompt.toLowerCase().includes('jazz') || 
                     prompt.toLowerCase().includes('electronic') || prompt.toLowerCase().includes('classical');
    const hasMood = prompt.toLowerCase().includes('happy') || prompt.toLowerCase().includes('sad') || 
                    prompt.toLowerCase().includes('energetic') || prompt.toLowerCase().includes('calm');
    
    const qualityScore = (hasGenre ? 4 : 0) + (hasMood ? 3 : 0) + (length > 50 ? 3 : 0);

    return {
      qualityScore,
      strengths: length > 20 ? ['Sufficient length', 'Contains descriptive elements'] : ['Concise'],
      weaknesses: hasGenre ? [] : ['Lacks genre specification', hasMood ? [] : ['Missing mood description']],
      recommendations: hasGenre ? [] : ['Specify musical genre', hasMood ? [] : ['Add emotional context']],
      platformEffectiveness: {
        suno: qualityScore > 5 ? 'medium' : 'low',
        udio: qualityScore > 5 ? 'medium' : 'low',
        stability: qualityScore > 5 ? 'medium' : 'low'
      }
    };
  }

  // Generate multiple prompt variations
  async generatePromptVariations(userId, basePrompt, options = {}) {
    if (!this.rateLimiter.canMakeRequest()) {
      throw new Error('Rate limit exceeded for OpenAI service');
    }

    const { genre, mood, style, variationCount = 3 } = options;
    const variations = [];
    
    for (let i = 0; i < variationCount; i++) {
      try {
        const variationRequest = {
          originalPrompt: basePrompt,
          genre,
          mood,
          style,
          complexity: 'medium',
          length: 'medium'
        };
        
        const result = await this.rewritePrompt(userId, variationRequest);
        variations.push(result.rewrittenPrompt);
      } catch (error) {
        console.error(`Failed to generate variation ${i + 1}:`, error);
        variations.push(basePrompt); // Use original as fallback
      }
    }

    return variations;
  }

  // Optimize prompt for specific platform
  async optimizeForPlatform(userId, prompt, platform, options = {}) {
    const platformOptimizedRequest = {
      ...options,
      originalPrompt: prompt,
      targetPlatform: platform,
      complexity: platform === 'suno' ? 'simple' : 'medium'
    };

    return await this.rewritePrompt(userId, platformOptimizedRequest);
  }

  // Generate cache key
  generateCacheKey(promptRequest, options) {
    const { originalPrompt, genre, mood, style, complexity, length } = promptRequest;
    return `${originalPrompt}-${genre}-${mood}-${style}-${complexity}-${length}-${JSON.stringify(options)}`;
  }

  // Make API request with retry logic
  async makeApiRequest(prompt, apiKey, options = {}) {
    try {
      const { model = config.openai.model, maxTokens = config.openai.maxTokens, temperature = config.openai.temperature } = options;
      
      const response = await fetch(config.openai.apiUrl + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Organization': config.openai.organization || ''
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature,
          response_format: { type: 'json_object' }
        }),
        timeout: config.openai.timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch (parseError) {
        // If JSON parsing fails, return the raw content
        return {
          rewrittenPrompt: content,
          analysis: 'Response received but could not parse as JSON',
          improvements: []
        };
      }
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
    return {
      service: this.serviceName,
      remainingRequests: this.rateLimiter.getRemainingRequests(),
      limit: config.general.rateLimit,
      resetTime: Date.now() + 60000, // Next reset in 1 minute
      cachedPrompts: this.promptCache.size
    };
  }

  // Clear prompt cache
  clearCache() {
    this.promptCache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;

    for (const [key, entry] of this.promptCache) {
      if (now - entry.timestamp < config.general.cacheTTL) {
        activeEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.promptCache.size,
      activeEntries,
      expiredEntries,
      cacheTTL: config.general.cacheTTL
    };
  }
}

module.exports = new OpenAIService();