// AI Services Configuration
const config = {
  // Google Gemini Configuration
  gemini: {
    apiKey: process.env.GOOGLE_GEMINI_API_KEY,
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    model: 'gemini-pro',
    maxTokens: 1024,
    temperature: 0.8,
    timeout: parseInt(process.env.AI_SERVICE_TIMEOUT) || 30000,
    maxRetries: parseInt(process.env.AI_SERVICE_MAX_RETRIES) || 3,
  },

  // Nano Banana Configuration
  nanobanana: {
    apiKey: process.env.NANO_BANANA_API_KEY,
    apiUrl: 'https://api.nanobanana.com/v1',
    model: 'stable-diffusion-xl',
    defaultSize: { width: 512, height: 512 },
    steps: 20,
    cfgScale: 7,
    timeout: parseInt(process.env.AI_SERVICE_TIMEOUT) || 30000,
    maxRetries: parseInt(process.env.AI_SERVICE_MAX_RETRIES) || 3,
  },

  // Seedance Configuration
  seedance: {
    apiKey: process.env.SEEDANCE_API_KEY,
    apiUrl: 'https://api.seedance.com/v1',
    model: 'midjourney',
    defaultSize: '512x512',
    quality: 'standard',
    timeout: parseInt(process.env.AI_SERVICE_TIMEOUT) || 30000,
    maxRetries: parseInt(process.env.AI_SERVICE_MAX_RETRIES) || 3,
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORGANIZATION,
    apiUrl: 'https://api.openai.com/v1',
    model: 'gpt-4',
    maxTokens: 1000,
    temperature: 0.7,
    timeout: parseInt(process.env.AI_SERVICE_TIMEOUT) || 30000,
    maxRetries: parseInt(process.env.AI_SERVICE_MAX_RETRIES) || 3,
  },

  // General AI Service Configuration
  general: {
    rateLimit: parseInt(process.env.AI_SERVICE_RATE_LIMIT) || 100,
    timeout: parseInt(process.env.AI_SERVICE_TIMEOUT) || 30000,
    maxRetries: parseInt(process.env.AI_SERVICE_MAX_RETRIES) || 3,
    fallbackEnabled: true,
    cacheEnabled: true,
    cacheTTL: 3600000, // 1 hour in milliseconds
  },

  // Image Generation Templates
  imageTemplates: {
    artistProfile: {
      prompt: "Generate a profile picture for an AI artist",
      styles: {
        electronic: "futuristic digital aesthetic, neon colors, cyberpunk elements",
        hip_hop: "urban street style, bold colors, modern fashion",
        classical: "elegant timeless portrait, classical art style, sophisticated",
        jazz: "smooth sophisticated vibe, warm colors, artistic expression",
        rock: "edgy rockstar appearance, dynamic pose, electric energy",
        pop: "bright colorful style, modern pop art, engaging expression"
      }
    }
  },

  // Bio Generation Templates
  bioTemplates: {
    electronic: {
      style: "innovative and futuristic",
      signature: "pioneering the future of sound",
      tone: "Futuristic and energetic",
      keywords: ["synthesis", "digital", "electronic", "innovation", "technology"]
    },
    hip_hop: {
      style: "authentic and groundbreaking",
      signature: "redefining the rhythm of tomorrow",
      tone: "Confident and authentic",
      keywords: ["rhythm", "flow", "beats", "lyrics", "street", "culture"]
    },
    classical: {
      style: "timeless and sophisticated",
      signature: "bridging tradition with innovation",
      tone: "Elegant and refined",
      keywords: ["symphony", "orchestra", "composition", "precision", "beauty", "tradition"]
    },
    jazz: {
      style: "improvisational and creative",
      signature: "where melody meets machine",
      tone: "Smooth and sophisticated",
      keywords: ["improvisation", "sophistication", "melody", "harmony", "swing", "class"]
    },
    rock: {
      style: "powerful and rebellious",
      signature: "rocking the digital revolution",
      tone: "Powerful and rebellious",
      keywords: ["guitar", "drums", "energy", "rebellion", "passion", "power"]
    },
    pop: {
      style: "catchy and innovative",
      signature: "creating the next big thing",
      tone: "Energetic and catchy",
      keywords: ["melody", "hook", "viral", "trendy", "accessible", "mainstream"]
    },
    ambient: {
      style: "Atmospheric soundscapes and digital meditation",
      signature: "The architect of atmosphere",
      tone: "Calm and immersive",
      keywords: ["atmosphere", "ambient", "meditation", "space", "immersive", "calm"]
    },
    experimental: {
      style: "Boundary-pushing sonic exploration",
      signature: "The pioneer of the possible",
      tone: "Innovative and avant-garde",
      keywords: ["experimental", "innovation", "exploration", "avant-garde", "future", "unknown"]
    },
    // Artist Persona Templates
    visionary: {
      style: "Forward-thinking artistic innovation",
      signature: "Seeing beyond the horizon",
      tone: "Inspiring and visionary",
      keywords: ["vision", "future", "innovation", "inspiration", "dream", "possibility"]
    },
    rebel: {
      style: "Defiant artistic expression",
      signature: "Breaking the rules, creating the future",
      tone: "Edgy and rebellious",
      keywords: ["rebel", "defiant", "edge", "revolution", "change", "disrupt"]
    },
    innovator: {
      style: "Cutting-edge technological artistry",
      signature: "Inventing tomorrow's sound today",
      tone: "Progressive and technical",
      keywords: ["innovation", "technology", "progress", "cutting-edge", "future", "advance"]
    },
    storyteller: {
      style: "Narrative-driven emotional journeys",
      signature: "Every note tells a story",
      tone: "Emotional and narrative",
      keywords: ["story", "narrative", "journey", "emotion", "tale", "experience"]
    },
    virtuoso: {
      style: "Technical mastery and artistic excellence",
      signature: "The perfectionist of pixels",
      tone: "Precise and masterful",
      keywords: ["mastery", "excellence", "precision", "technique", "perfect", "flawless"]
    },
    mystic: {
      style: "Enigmatic and otherworldly soundscapes",
      signature: "Channeling the digital unknown",
      tone: "Mysterious and ethereal",
      keywords: ["mystery", "ethereal", "unknown", "spiritual", "mystic", "otherworldly"]
    },
    default: {
      style: "Digital innovation and artistic experimentation",
      signature: "Where code meets creativity",
      tone: "Balanced and creative",
      keywords: ["innovation", "creativity", "digital", "artistic", "experiment", "future"]
    }
  }
};

// Validate configuration
function validateConfig() {
  const requiredKeys = [
    'GOOGLE_GEMINI_API_KEY',
    'NANO_BANANA_API_KEY', 
    'SEEDANCE_API_KEY',
    'OPENAI_API_KEY'
  ];

  const missingKeys = requiredKeys.filter(key => !process.env[key]);
  
  if (missingKeys.length > 0) {
    console.warn('Missing AI service API keys:', missingKeys);
    return false;
  }

  return true;
}

module.exports = {
  config,
  validateConfig
};