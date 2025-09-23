import { MAGIC_HOUR_API_KEY } from '../../constants';
import { getUserProperties } from '../properties';

const MAGIC_HOUR_BASE_URL = 'https://api.magichour.ai';

interface MagicHourResponse {
  id: string;
  credits_charged: number;
  frame_cost?: number;
}

interface MagicHourProjectStatus {
  id: string;
  name: string | null;
  status: 'draft' | 'queued' | 'rendering' | 'complete' | 'error' | 'canceled';
  image_count: number;
  type: string;
  created_at: string;
  enabled: boolean;
  total_frame_cost: number;
  credits_charged: number;
  downloads: Array<{
    url: string;
    expires_at: string;
  }>;
  error: unknown | null;
}

// AI Image Generator Tools/Styles - Actual Magic Hour API options
export const AI_IMAGE_TOOLS = {
  'ai-anime-generator': 'Anime Style Generator',
  'ai-art-generator': 'AI Art Generator',
  'ai-background-generator': 'AI Background Generator',
  'ai-character-generator': 'AI Character Generator',
  'ai-face-generator': 'AI Face Generator',
  'ai-fashion-generator': 'AI Fashion Generator',
  'ai-icon-generator': 'AI Icon Generator',
  'ai-illustration-generator': 'AI Illustration Generator',
  'ai-interior-design-generator': 'AI Interior Design Generator',
  'ai-landscape-generator': 'AI Landscape Generator',
  'ai-logo-generator': 'AI Logo Generator',
  'ai-manga-generator': 'AI Manga Generator',
  'ai-outfit-generator': 'AI Outfit Generator',
  'ai-pattern-generator': 'AI Pattern Generator',
  'ai-photo-generator': 'AI Photo Generator',
  'ai-sketch-generator': 'AI Sketch Generator',
  'ai-tattoo-generator': 'AI Tattoo Generator',
  'album-cover-generator': 'Album Cover Generator',
  'animated-characters-generator': 'Animated Characters Generator',
  'architecture-generator': 'Architecture Generator',
  'book-cover-generator': 'Book Cover Generator',
  'comic-book-generator': 'Comic Book Generator',
  'dark-fantasy-ai': 'Dark Fantasy AI',
  'disney-ai-generator': 'Disney AI Generator',
  'dnd-ai-art-generator': 'D&D AI Art Generator',
  'emoji-generator': 'Emoji Generator',
  'fantasy-map-generator': 'Fantasy Map Generator',
  'graffiti-generator': 'Graffiti Generator',
  'movie-poster-generator': 'Movie Poster Generator',
  'optical-illusion-generator': 'Optical Illusion Generator',
  'pokemon-generator': 'Pokemon Generator',
  'south-park-character-generator': 'South Park Character Generator',
  'superhero-generator': 'Superhero Generator',
  'thumbnail-maker': 'Thumbnail Maker',
  general: 'General AI Generator',
} as const;

// Magic Hour Tools Configuration
export const MAGIC_HOUR_TOOLS = {
  'ai-image-generator': {
    name: 'AI Image Generator',
    endpoint: '/v1/ai-image-generator',
    credits: 5,
    parameters: {
      style: {
        prompt: {
          type: 'string',
          required: true,
          label: 'Describe Your Vision',
          placeholder:
            'What would you like to create? Be as detailed as possible...',
        },
        tool: {
          type: 'enum',
          values: Object.keys(AI_IMAGE_TOOLS),
          required: false,
          label: 'Art Style',
          placeholder: 'Select a creative style',
        },
      },
      image_count: {
        type: 'number',
        min: 1,
        max: 4,
        default: 1,
        label: 'Number of Images',
        placeholder: 'How many images to generate',
        display: false,
      },
      orientation: {
        type: 'enum',
        values: ['square', 'landscape', 'portrait'],
        default: 'landscape',
        label: 'Image Orientation',
        placeholder: 'Choose image dimensions',
      },
    },
  },
  'ai-gif-creator': {
    name: 'AI GIF Creator',
    endpoint: '/v1/ai-gif-generator',
    credits: 50,
    parameters: {
      style: {
        prompt: {
          type: 'string',
          required: true,
          label: 'Animation Description',
          placeholder: 'Describe the animated scene you want to create...',
        },
      },
      output_format: {
        type: 'enum',
        values: ['gif', 'mp4', 'webm'],
        default: 'gif',
        label: 'Output Format',
        placeholder: 'File format for the animation',
      },
    },
  },
  'ai-headshot-generator': {
    name: 'AI Headshot Generator',
    endpoint: '/v1/ai-headshot-generator',
    credits: 50,
    parameters: {
      assets: {
        image_file_path: {
          type: 'string',
          required: true,
          label: 'Source Photo',
          placeholder: 'Upload your photo or enter image URL',
        },
      },
      style: {
        prompt: {
          type: 'string',
          required: false,
          label: 'Style Instructions',
          placeholder: 'Describe the professional style you want (optional)...',
        },
      },
    },
  },
  'ai-meme-generator': {
    name: 'AI Meme Generator',
    endpoint: '/v1/ai-meme-generator',
    credits: 10,
    parameters: {
      style: {
        topic: {
          type: 'string',
          required: true,
          label: 'Meme Topic',
          placeholder: 'What should your meme be about?',
        },
        template: {
          type: 'enum',
          values: [
            'Random',
            'Drake Hotline Bling',
            'Galaxy Brain',
            "Two Buttons, Gru's Plan",
            'Tuxedo Winnie The Pooh',
            'Is This a Pigeon',
            'Panik Kalm Panik',
            'Disappointed Guy',
            'Waiting Skeleton',
            'Bike Fall',
            'Change My Mind',
            'Side Eyeing Chloe',
          ],
          default: 'Drake Hotline Bling',
          label: 'Meme Template',
          placeholder: 'Choose a meme format',
        },
        searchWeb: {
          type: 'boolean',
          default: false,
          label: 'Search web for content',
          description: 'Whether to search the web for meme content.',
        },
      },
    },
  },
  'image-background-remover': {
    name: 'AI Image Background Remover',
    endpoint: '/v1/image-background-remover',
    credits: 5,
    parameters: {
      assets: {
        image_file_path: {
          type: 'string',
          required: true,
          label: 'Source Image',
          placeholder: 'Upload image or enter URL',
        },
        background_image_file_path: {
          type: 'string',
          required: false,
          label: 'New Background (Optional)',
          placeholder:
            'Upload replacement background or leave empty to remove only',
        },
      },
    },
  },
  'face-swap-photo': {
    name: 'AI Face Swapper',
    endpoint: '/v1/face-swap-photo',
    credits: 5,
    parameters: {
      assets: {
        target_file_path: {
          type: 'string',
          required: true,
          label: 'Target Photo',
          placeholder: 'Upload photo where face will be swapped',
        },
        source_file_path: {
          type: 'string',
          required: false,
          label: 'Source Face (Optional)',
          placeholder: 'Upload photo with face to copy from',
        },
        face_swap_mode: {
          type: 'enum',
          values: ['individual-faces'],
          default: 'individual-faces',
          label: 'Swap Mode',
          placeholder: 'How to handle multiple faces',
        },
      },
    },
  },
  'ai-clothes-changer': {
    name: 'AI Clothes Changer',
    endpoint: '/v1/ai-clothes-changer',
    credits: 25,
    parameters: {
      assets: {
        person_file_path: {
          type: 'string',
          required: true,
          label: 'Person Photo',
          placeholder: 'Upload photo of person to change clothes',
        },
        garment_file_path: {
          type: 'string',
          required: true,
          label: 'Clothing Item',
          placeholder: 'Upload photo of clothing to apply',
        },
        garment_type: {
          type: 'enum',
          values: ['upper_body', 'lower_body', 'full_body'],
          required: true,
          label: 'Clothing Type',
          placeholder: 'What part of outfit to change',
        },
      },
    },
  },
} as const;

/**
 * Get Magic Hour API key from user properties
 */
function getApiKey(): string {
  const apiKey = getUserProperties(MAGIC_HOUR_API_KEY);
  if (!apiKey) {
    throw new Error(
      'Magic Hour API key not found in user properties. Please set your API key first.'
    );
  }
  return apiKey;
}

/**
 * Make HTTP request to Magic Hour API
 */
function makeApiRequest(
  endpoint: string,
  payload: Record<string, unknown>
): MagicHourResponse {
  const url = `${MAGIC_HOUR_BASE_URL}${endpoint}`;
  const apiKey = getApiKey();

  const options = {
    method: 'POST' as const,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(payload),
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (responseCode !== 200) {
    let errorMessage = `Magic Hour API error (${responseCode})`;
    try {
      const errorData = JSON.parse(responseText);
      errorMessage += `: ${errorData.message || responseText}`;
    } catch {
      errorMessage += `: ${responseText}`;
    }
    throw new Error(errorMessage);
  }

  return JSON.parse(responseText);
}

/**
 * Check the status of a Magic Hour project
 */
export function checkProjectStatus(projectId: string): MagicHourProjectStatus {
  const url = `${MAGIC_HOUR_BASE_URL}/v1/image-projects/${projectId}`;
  const apiKey = getApiKey();

  const options = {
    method: 'GET' as const,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (responseCode !== 200) {
    throw new Error(`Failed to check project status: ${responseText}`);
  }

  return JSON.parse(responseText);
}

/**
 * AI Image Generator - Create AI images with various styles and tools
 */
export function generateAIImage(params: {
  prompt: string;
  imageCount?: number;
  orientation?: 'square' | 'landscape' | 'portrait';
  tool?: keyof typeof AI_IMAGE_TOOLS;
  name?: string;
}): MagicHourResponse {
  const payload = {
    name: params.name || 'AI Generated Image',
    image_count: params.imageCount || 1,
    orientation: params.orientation || 'landscape',
    style: {
      prompt: params.prompt,
      ...(params.tool && { tool: params.tool }),
    },
  };

  return makeApiRequest('/v1/ai-image-generator', payload);
}

/**
 * AI GIF Creator - Create animated GIFs from text prompts
 */
export function generateAIGif(params: {
  prompt: string;
  name?: string;
}): MagicHourResponse {
  const payload = {
    name: params.name || 'AI Generated GIF',
    style: {
      prompt: params.prompt,
    },
    output_format: 'gif',
  };

  return makeApiRequest('/v1/ai-gif-generator', payload);
}

/**
 * AI Headshot Generator - Generate professional headshots from selfies
 */
export function generateAIHeadshot(params: {
  imageUrl: string;
  prompt?: string;
  name?: string;
}): MagicHourResponse {
  const payload = {
    name: params.name || 'AI Generated Headshot',
    style: {
      ...(params.prompt && { prompt: params.prompt }),
    },
    assets: {
      image_file_path: params.imageUrl,
    },
  };

  return makeApiRequest('/v1/ai-headshot-generator', payload);
}

/**
 * AI Meme Generator - Generate memes with AI
 */
export function generateAIMeme(params: {
  topic: string;
  template?: string;
  searchWeb?: boolean;
  name?: string;
}): MagicHourResponse {
  const payload = {
    name: params.name || 'AI Generated Meme',
    style: {
      topic: params.topic,
      ...(params.template && { template: params.template }),
      searchWeb: params.searchWeb || false,
    },
  };

  return makeApiRequest('/v1/ai-meme-generator', payload);
}

/**
 * Image Background Remover - Remove or replace image backgrounds
 */
export function removeImageBackground(params: {
  imageUrl: string;
  backgroundImageUrl?: string;
  name?: string;
}): MagicHourResponse {
  const payload = {
    name: params.name || 'Background Removed Image',
    assets: {
      image_file_path: params.imageUrl,
      ...(params.backgroundImageUrl && {
        background_image_file_path: params.backgroundImageUrl,
      }),
    },
  };

  return makeApiRequest('/v1/image-background-remover', payload);
}

/**
 * Face Swap Photo - Swap faces in photos
 */
export function swapFaces(params: {
  targetImageUrl: string;
  sourceImageUrl?: string;
  faceSwapMode?: 'all-faces' | 'individual-faces';
  faceMappings?: Array<{ original_face: string; new_face: string }>;
  name?: string;
}): MagicHourResponse {
  const payload = {
    name: params.name || 'Face Swap Photo',
    assets: {
      face_swap_mode: params.faceSwapMode || 'all-faces',
      target_file_path: params.targetImageUrl,
      ...(params.sourceImageUrl && { source_file_path: params.sourceImageUrl }),
      ...(params.faceMappings && { face_mappings: params.faceMappings }),
    },
  };

  return makeApiRequest('/v1/face-swap-photo', payload);
}

/**
 * AI Clothes Changer - Change outfits in photos
 */
export function changeClothes(params: {
  personImageUrl: string;
  garmentImageUrl: string;
  garmentType: 'upper_body' | 'lower_body' | 'full_body';
  name?: string;
}): MagicHourResponse {
  const payload = {
    name: params.name || 'Clothes Changed Photo',
    assets: {
      person_file_path: params.personImageUrl,
      garment_file_path: params.garmentImageUrl,
      garment_type: params.garmentType,
    },
  };

  return makeApiRequest('/v1/ai-clothes-changer', payload);
}

/**
 * Main entry point - Route requests to appropriate Magic Hour tool
 */
export function processWithMagicHour(
  params: {
    tool: keyof typeof MAGIC_HOUR_TOOLS;
  } & Record<string, unknown>
): MagicHourResponse {
  const { tool, ...toolParams } = params;

  if (!MAGIC_HOUR_TOOLS[tool]) {
    throw new Error(
      `Unsupported Magic Hour tool: ${tool}. Available tools: ${Object.keys(
        MAGIC_HOUR_TOOLS
      ).join(', ')}`
    );
  }

  switch (tool) {
    case 'ai-image-generator':
      return generateAIImage(
        toolParams as Parameters<typeof generateAIImage>[0]
      );
    case 'ai-gif-creator':
      return generateAIGif(toolParams as Parameters<typeof generateAIGif>[0]);
    case 'ai-headshot-generator':
      return generateAIHeadshot(
        toolParams as Parameters<typeof generateAIHeadshot>[0]
      );
    case 'ai-meme-generator':
      return generateAIMeme(toolParams as Parameters<typeof generateAIMeme>[0]);
    case 'image-background-remover':
      return removeImageBackground(
        toolParams as Parameters<typeof removeImageBackground>[0]
      );
    case 'face-swap-photo':
      return swapFaces(toolParams as Parameters<typeof swapFaces>[0]);
    case 'ai-clothes-changer':
      return changeClothes(toolParams as Parameters<typeof changeClothes>[0]);
    default:
      throw new Error(`Tool implementation not found: ${tool}`);
  }
}

/**
 * Wait for project completion and return the result
 */
export function waitForCompletion(
  projectId: string,
  maxWaitTime = 300000,
  pollInterval = 1000
): MagicHourProjectStatus {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const status = checkProjectStatus(projectId);

    if (status.status === 'complete') {
      return status;
    }

    if (status.status === 'error') {
      const errorMessage = status.error as { message?: string } | null;
      throw new Error(
        `Magic Hour project failed: ${errorMessage?.message || 'Unknown error'}`
      );
    }

    if (status.status === 'canceled') {
      throw new Error('Magic Hour project was canceled');
    }

    // Wait before polling again
    Utilities.sleep(pollInterval);
  }

  throw new Error(
    `Magic Hour project timed out after ${maxWaitTime / 1000} seconds`
  );
}

/**
 * Get tool information and pricing
 */
export function getToolInfo(toolKey?: keyof typeof MAGIC_HOUR_TOOLS) {
  if (toolKey) {
    return MAGIC_HOUR_TOOLS[toolKey];
  }
  return MAGIC_HOUR_TOOLS;
}

/**
 * Get available AI Image Generator styles/tools
 */
export function getAIImageTools() {
  return AI_IMAGE_TOOLS;
}
