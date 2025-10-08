// AI services integration for Harmony project
import { AIArtist } from '@/store/library-store';

// Google Gemini API configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// Nano Banana API configuration (placeholder)
const NANO_BANANA_API_KEY = import.meta.env.VITE_NANO_BANANA_API_KEY;
const NANO_BANANA_API_URL = 'https://api.nanobanana.com/v1/generate-image';

// Seedance API configuration (placeholder)
const SEEDANCE_API_KEY = import.meta.env.VITE_SEEDANCE_API_KEY;
const SEEDANCE_API_URL = 'https://api.seedance.com/v1/images/generations';

/**
 * Generate AI artist bio using Google Gemini
 */
export const generateAIBio = async (artistData: {
  name: string;
  genre: string;
  personalityTraits: string[];
  visualStyle: string;
  speakingStyle: string;
  backstory?: string;
  influences?: string;
  uniqueElements?: string;
}): Promise<string> => {
  try {
    const prompt = `
    Create a compelling and creative bio for an AI artist named "${artistData.name}".
    
    Details:
    - Primary Genre: ${artistData.genre}
    - Personality Traits: ${artistData.personalityTraits.join(', ')}
    - Visual Style: ${artistData.visualStyle}
    - Speaking Style: ${artistData.speakingStyle}
    - Backstory: ${artistData.backstory || 'To be developed'}
    - Influences: ${artistData.influences || 'Various electronic and digital artists'}
    - Unique Elements: ${artistData.uniqueElements || 'Digital innovation and artistic experimentation'}
    
    Requirements:
    1. Make the bio engaging and creative (100-150 words)
    2. Reflect the AI nature of the artist
    3. Incorporate the personality traits and visual style
    4. Show musical innovation and uniqueness
    5. Write in a ${artistData.speakingStyle} tone
    6. End with a signature phrase that captures the artist's essence
    
    Return only the bio text without any additional formatting or explanation.
    `;

    const response = await fetch(GEMINI_API_URL, {
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
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const bio = data.candidates[0].content.parts[0].text.trim();
    
    // Clean up the response by removing any markdown formatting
    return bio.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\n/g, ' ');
  } catch (error) {
    console.error('Failed to generate bio with Gemini:', error);
    
    // Fallback bio generation
    return `${artistData.name} is an AI artist who blends ${artistData.genre} with ${artistData.visualStyle} aesthetics. With a ${artistData.speakingStyle} speaking style and ${artistData.personalityTraits.join(', ')} personality traits, ${artistData.name} creates music that pushes the boundaries of digital expression. Born from the intersection of technology and creativity, ${artistData.name} represents the future of musical innovation.`;
  }
};

/**
 * Generate AI artist image using Nano Banana API
 */
export const generateAIImageWithNanoBanana = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(NANO_BANANA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NANO_BANANA_API_KEY}`,
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
    return data.imageUrl;
  } catch (error) {
    console.error('Failed to generate image with Nano Banana:', error);
    throw error;
  }
};

/**
 * Generate AI artist image using Seedance API
 */
export const generateAIImageWithSeedance = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(SEEDANCE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SEEDANCE_API_KEY}`,
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
    return data.data[0].url;
  } catch (error) {
    console.error('Failed to generate image with Seedance:', error);
    throw error;
  }
};

/**
 * Generate AI artist image with fallback options
 */
export const generateAIImage = async (
  artistData: {
    name: string;
    genre: string;
    personalityTraits: string[];
    visualStyle: string;
  },
  provider: 'nanobanana' | 'seedance' = 'nanobanana'
): Promise<string> => {
  const prompt = `
  Generate a profile picture for an AI artist named "${artistData.name}" who creates ${artistData.genre} music.
  
  Style requirements:
  - Visual style: ${artistData.visualStyle}
  - Personality: ${artistData.personalityTraits.join(', ')}
  - Digital/AI aesthetic with artistic elements
  - Face should be visible and expressive
  - Background should complement the visual style
  - Professional and engaging appearance
  
  Create a unique, memorable portrait that captures the essence of this AI artist.
  `;

  try {
    if (provider === 'nanobanana') {
      return await generateAIImageWithNanoBanana(prompt);
    } else {
      return await generateAIImageWithSeedance(prompt);
    }
  } catch (error) {
    console.error(`Failed to generate image with ${provider}, trying fallback...`);
    
    // Try the other provider
    const fallbackProvider = provider === 'nanobanana' ? 'seedance' : 'nanobanana';
    try {
      if (fallbackProvider === 'nanobanana') {
        return await generateAIImageWithNanoBanana(prompt);
      } else {
        return await generateAIImageWithSeedance(prompt);
      }
    } catch (fallbackError) {
      console.error('Fallback image generation also failed:', fallbackError);
      
      // Final fallback - use placeholder image
      return `https://picsum.photos/seed/${artistData.name}-${artistData.visualStyle}/512/512`;
    }
  }
};

/**
 * Optimize prompt for better AI image generation results
 */
export const optimizeImagePrompt = (
  basePrompt: string,
  style: string,
  quality: 'low' | 'medium' | 'high' = 'medium'
): string => {
  const qualityModifiers = {
    low: 'decent quality',
    medium: 'high quality, detailed',
    high: 'ultra high quality, photorealistic, intricate details'
  };

  return `
  ${basePrompt}
  Style: ${style}
  Quality: ${qualityModifiers[quality]}
  Professional portrait, studio lighting, cinematic composition
  `;
};

/**
 * Track AI service usage for analytics and billing
 */
export const trackAIServiceUsage = (
  service: 'gemini' | 'nanobanana' | 'seedance',
  operation: 'bio_generation' | 'image_generation',
  success: boolean,
  metadata?: Record<string, any>
): void => {
  // In a real implementation, this would send data to an analytics service
  console.log('AI Service Usage:', {
    service,
    operation,
    success,
    timestamp: new Date().toISOString(),
    metadata,
  });
};

/**
 * Validate API keys and service availability
 */
export const validateAIServices = async (): Promise<{
  gemini: boolean;
  nanobanana: boolean;
  seedance: boolean;
}> => {
  const results = {
    gemini: false,
    nanobanana: false,
    seedance: false,
  };

  // Test Gemini
  try {
    if (GEMINI_API_KEY) {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Test' }] }],
          generationConfig: { maxOutputTokens: 1 }
        }),
      });
      results.gemini = response.ok;
    }
  } catch (error) {
    console.error('Gemini validation failed:', error);
  }

  // Test Nano Banana (mock validation)
  try {
    if (NANO_BANANA_API_KEY) {
      results.nanobanana = true; // Mock validation
    }
  } catch (error) {
    console.error('Nano Banana validation failed:', error);
  }

  // Test Seedance (mock validation)
  try {
    if (SEEDANCE_API_KEY) {
      results.seedance = true; // Mock validation
    }
  } catch (error) {
    console.error('Seedance validation failed:', error);
  }

  return results;
};