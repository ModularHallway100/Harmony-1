// Secure API Key Management System
const crypto = require('crypto');
const { config } = require('../config/ai-services');

class AIKeyManager {
  constructor() {
    this.keyCache = new Map();
    this.encryptionKey = process.env.AI_KEY_ENCRYPTION_KEY || this.generateEncryptionKey();
    this.cacheTTL = config.general.cacheTTL || 3600000; // 1 hour
  }

  // Generate a random encryption key if none exists
  generateEncryptionKey() {
    const key = crypto.randomBytes(32).toString('hex');
    console.warn('Generated new AI key encryption key. Set AI_KEY_ENCRYPTION_KEY in environment to persist this key.');
    return key;
  }

  // Encrypt API keys for storage
  encryptApiKey(apiKey, serviceName) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { encrypted, iv: iv.toString('hex') };
  }

  // Decrypt API keys
  decryptApiKey(encryptedData, iv) {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Get API key with caching
  getApiKey(serviceName) {
    // Check cache first
    const cached = this.keyCache.get(serviceName);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.key;
    }

    // Get from environment
    const apiKey = process.env[serviceName.toUpperCase() + '_API_KEY'];
    
    if (!apiKey) {
      throw new Error(`API key for ${serviceName} not found in environment`);
    }

    // Cache the key
    this.keyCache.set(serviceName, {
      key: apiKey,
      timestamp: Date.now()
    });

    return apiKey;
  }

  // Validate API key format
  validateApiKey(apiKey, serviceName) {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }

    // Basic validation - can be extended per service
    const minLength = 20;
    const maxLength = 100;
    
    if (apiKey.length < minLength || apiKey.length > maxLength) {
      return false;
    }

    // Check for common patterns that indicate invalid keys
    const invalidPatterns = [
      /your-.*-key/i,
      /placeholder/i,
      /demo/i,
      /test/i
    ];

    return !invalidPatterns.some(pattern => pattern.test(apiKey));
  }

  // Rate limiting helper
  createRateLimiter(serviceName, limit, windowMs) {
    const requests = new Map();
    
    return {
      canMakeRequest: () => {
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Clean old requests
        for (const [timestamp] of requests) {
          if (timestamp < windowStart) {
            requests.delete(timestamp);
          }
        }

        // Check if limit exceeded
        if (requests.size >= limit) {
          return false;
        }

        // Add current request
        requests.set(now, true);
        return true;
      },

      getRemainingRequests: () => {
        const now = Date.now();
        const windowStart = now - windowMs;
        
        for (const [timestamp] of requests) {
          if (timestamp < windowStart) {
            requests.delete(timestamp);
          }
        }

        return Math.max(0, limit - requests.size);
      },

      reset: () => {
        requests.clear();
      }
    };
  }

  // Service health check
  async checkServiceHealth(serviceName) {
    try {
      const apiKey = this.getApiKey(serviceName);
      
      if (!this.validateApiKey(apiKey, serviceName)) {
        return { healthy: false, error: 'Invalid API key format' };
      }

      // Service-specific health checks would go here
      // For now, just validate the key exists and is properly formatted
      return { healthy: true, message: 'Service key is valid' };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }

  // Get all service statuses
  async getAllServiceStatuses() {
    const services = ['gemini', 'nanobanana', 'seedance', 'openai'];
    const statuses = {};

    for (const service of services) {
      statuses[service] = await this.checkServiceHealth(service);
    }

    return statuses;
  }

  // Clear key cache
  clearCache() {
    this.keyCache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;

    for (const [serviceName, entry] of this.keyCache) {
      if (now - entry.timestamp < this.cacheTTL) {
        activeEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.keyCache.size,
      activeEntries,
      expiredEntries,
      cacheTTL: this.cacheTTL
    };
  }
}

// Create singleton instance
const aiKeyManager = new AIKeyManager();

module.exports = aiKeyManager;