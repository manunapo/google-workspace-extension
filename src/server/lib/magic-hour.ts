import { MAGIC_HOUR_API_KEY } from '../../constants';
import { getScriptProperties } from '../properties';
import { convertUrlToBase64 } from '../utils';

const MAGIC_HOUR_BASE_URL = 'https://api.magichour.ai';
const MAGIC_HOUR_CLIENT_ERROR_MSG =
  'There was an issue generating the image. Please try again.';
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
          required: true,
          label: 'Style',
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
          type: 'image_url',
          required: true,
          label: 'Source Photo',
          placeholder: 'Upload your photo',
        },
      },
      style: {
        prompt: {
          type: 'string',
          required: false,
          label: 'Style Instructions',
          placeholder:
            'We recommend omitting the prompt unless you want to customize your headshot.',
        },
      },
      name: {
        type: 'string',
        required: false,
        label: 'Name',
        placeholder: 'Enter a name for the headshot',
        display: false,
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
          type: 'image_url',
          required: true,
          label: 'Source Image',
          placeholder: 'Upload the original image',
        },
        background_image_file_path: {
          type: 'image_url',
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
          type: 'image_url',
          required: true,
          label: 'Target Photo',
          placeholder: 'Upload photo where face will be swapped',
        },
        source_file_path: {
          type: 'image_url',
          required: false,
          label: 'Source Face (Optional)',
          placeholder: 'Upload photo with face to copy from',
        },
        face_swap_mode: {
          type: 'enum',
          values: ['all-faces'],
          default: 'all-faces',
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
          type: 'image_url',
          required: true,
          label: 'Person Photo',
          placeholder: 'Upload photo of person to change clothes',
        },
        garment_file_path: {
          type: 'image_url',
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
  const apiKey = getScriptProperties(MAGIC_HOUR_API_KEY);
  if (!apiKey) {
    throw new Error(MAGIC_HOUR_CLIENT_ERROR_MSG);
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
    console.log(errorMessage);
    throw new Error(MAGIC_HOUR_CLIENT_ERROR_MSG);
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
    console.log(`Failed to check project status: ${responseText}`);
    throw new Error(MAGIC_HOUR_CLIENT_ERROR_MSG);
  }

  return JSON.parse(responseText);
}

/**
 * AI Image Generator - Create AI images with various styles and tools
 */
export function generateAIImage(
  params: Record<string, unknown>
): MagicHourResponse {
  return makeApiRequest('/v1/ai-image-generator', params);
}

/**
 * AI GIF Creator - Create animated GIFs from text prompts
 */
export function generateAIGif(
  params: Record<string, unknown>
): MagicHourResponse {
  return makeApiRequest('/v1/ai-gif-generator', params);
}

/**
 * AI Headshot Generator - Generate professional headshots from selfies
 */
export function generateAIHeadshot(
  params: Record<string, unknown>
): MagicHourResponse {
  return makeApiRequest('/v1/ai-headshot-generator', params);
}

/**
 * AI Meme Generator - Generate memes with AI
 */
export function generateAIMeme(
  params: Record<string, unknown>
): MagicHourResponse {
  return makeApiRequest('/v1/ai-meme-generator', params);
}

/**
 * Image Background Remover - Remove or replace image backgrounds
 */
export function removeImageBackground(
  params: Record<string, unknown>
): MagicHourResponse {
  return makeApiRequest('/v1/image-background-remover', params);
}

/**
 * Face Swap Photo - Swap faces in photos
 */
export function swapFaces(params: Record<string, unknown>): MagicHourResponse {
  return makeApiRequest('/v1/face-swap-photo', params);
}

/**
 * AI Clothes Changer - Change outfits in photos
 */
export function changeClothes(
  params: Record<string, unknown>
): MagicHourResponse {
  return makeApiRequest('/v1/ai-clothes-changer', params);
}

/**
 * Wait for project completion and return the result
 */
export function waitForCompletion(
  projectId: string,
  maxWaitTime = 40000, // 60 seconds
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
      console.log(
        `Magic Hour project failed: ${errorMessage?.message || 'Unknown error'}`
      );
      throw new Error(MAGIC_HOUR_CLIENT_ERROR_MSG);
    }

    if (status.status === 'canceled') {
      console.log('Magic Hour project was canceled');
      throw new Error(MAGIC_HOUR_CLIENT_ERROR_MSG);
    }

    // Wait before polling again
    Utilities.sleep(pollInterval);
  }

  console.error(
    `Magic Hour project timed out after ${maxWaitTime / 1000} seconds`
  );
  throw new Error(MAGIC_HOUR_CLIENT_ERROR_MSG);
}

/**
 * Extract download URL from completed Magic Hour project
 */
function extractDownloadUrl(status: MagicHourProjectStatus): string {
  if (status.status !== 'complete') {
    console.log(`Project not complete. Status: ${status.status}`);
    throw new Error(MAGIC_HOUR_CLIENT_ERROR_MSG);
  }

  if (!status.downloads || status.downloads.length === 0) {
    console.log('No download URLs available for completed project');
    throw new Error(MAGIC_HOUR_CLIENT_ERROR_MSG);
  }

  // Return the first available download URL
  return status.downloads[0].url;
}

/**
 * Main entry point - Route requests to appropriate Magic Hour tool
 * Automatically waits for completion and returns the base64 data URL
 */
export function processWithMagicHour(
  params: {
    tool: keyof typeof MAGIC_HOUR_TOOLS;
  } & Record<string, unknown>
): string {
  const { tool, ...toolParams } = params;

  if (!MAGIC_HOUR_TOOLS[tool]) {
    console.log(
      `Unsupported Magic Hour tool: ${tool}. Available tools: ${Object.keys(
        MAGIC_HOUR_TOOLS
      ).join(', ')}`
    );
    throw new Error(MAGIC_HOUR_CLIENT_ERROR_MSG);
  }

  let response: MagicHourResponse;

  switch (tool) {
    case 'ai-image-generator':
      response = generateAIImage(
        toolParams as Parameters<typeof generateAIImage>[0]
      );
      break;
    case 'ai-gif-creator':
      response = generateAIGif(
        toolParams as Parameters<typeof generateAIGif>[0]
      );
      break;
    case 'ai-headshot-generator':
      response = generateAIHeadshot(
        toolParams as Parameters<typeof generateAIHeadshot>[0]
      );
      break;
    case 'ai-meme-generator':
      response = generateAIMeme(
        toolParams as Parameters<typeof generateAIMeme>[0]
      );
      break;
    case 'image-background-remover':
      response = removeImageBackground(
        toolParams as Parameters<typeof removeImageBackground>[0]
      );
      break;
    case 'face-swap-photo':
      response = swapFaces(toolParams as Parameters<typeof swapFaces>[0]);
      break;
    case 'ai-clothes-changer':
      response = changeClothes(
        toolParams as Parameters<typeof changeClothes>[0]
      );
      break;
    default:
      console.log(`Tool implementation not found: ${tool}`);
      throw new Error(MAGIC_HOUR_CLIENT_ERROR_MSG);
  }

  // Wait for completion, get the download URL, and convert to base64
  const completedStatus = waitForCompletion(response.id);
  const downloadUrl = extractDownloadUrl(completedStatus);

  // Convert the Magic Hour URL to base64 before returning to client
  return convertUrlToBase64(downloadUrl, MAGIC_HOUR_CLIENT_ERROR_MSG);
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
