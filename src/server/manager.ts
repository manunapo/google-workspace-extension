/* eslint-disable no-console */
import { insertImageToDoc } from './documents';
import { generateGeminiImage } from './lib/gemini';
import {
  generateAIImage,
  generateAIGif,
  generateAIHeadshot,
  generateAIMeme,
  removeImageBackground,
  swapFaces,
  changeClothes,
} from './lib/magic-hour';
import { uploadImageAndGetUrl } from './lib/cloudinary';
import { deductDbUserCredits, getOrCreateDbUser, User } from './lib/supabase';
import { insertImageToSlide } from './slides';
import getUserEmail from './session';
import { insertImageToSheet } from './spreadsheets';
import { getScriptContext } from './ui';

/**
 * Higher-order function that wraps a function with user ID authentication
 * @param fn - Function that takes userId as first parameter
 * @returns Wrapped function that automatically handles user authentication
 */
function withUserIdAuth<T extends unknown[], R>(
  fn: (userId: string, ...args: T) => R
): (...args: T) => R {
  return (...args: T): R => {
    const userId = getUserEmail();

    if (!userId) {
      throw new Error('User email not found');
    }

    return fn(userId, ...args);
  };
}

export const getUserCredits = withUserIdAuth(
  (email: string): Pick<User, 'available_credits'> => {
    return getOrCreateDbUser(email);
  }
);

// Helper function to convert File objects to appropriate format
async function processFileParameters(
  parameters: Record<string, unknown>,
  toolRequiresUrls = true
): Promise<Record<string, unknown>> {
  const processed: Record<string, unknown> = {};

  const keys = Object.keys(parameters);
  const promises = keys.map(async (key) => {
    const value = parameters[key];
    if (value instanceof File) {
      if (toolRequiresUrls) {
        // Upload to Cloudinary and use URL (for Magic Hour tools)
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(value);
        });
        const url = await uploadImageAndGetUrl(base64);
        return { key, value: url };
      }
      // Convert to base64 (for Gemini tools)
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(value);
      });
      return { key, value: base64 };
    }
    if (typeof value === 'object' && value !== null) {
      // Recursively process nested objects
      const processedValue = await processFileParameters(
        value as Record<string, unknown>,
        toolRequiresUrls
      );
      return { key, value: processedValue };
    }
    return { key, value };
  });

  const results = await Promise.all(promises);
  results.forEach(({ key, value }) => {
    processed[key] = value;
  });

  return processed;
}

// Gemini Image Editor execution function
async function executeGeminiImageEditor(
  parameters: Record<string, unknown>
): Promise<string> {
  return generateGeminiImage(
    parameters.prompt as string,
    parameters.referenceImage as string,
    Number(parameters.temperature || 0.7)
  );
}

// Individual Magic Hour tool execution functions
async function executeAIImageGenerator(
  parameters: Record<string, unknown>
): Promise<string> {
  const processedParams = await processFileParameters(parameters, true);
  const style = (processedParams.style as Record<string, unknown>) || {};
  const result = await generateAIImage({
    prompt: style.prompt as string,
    imageCount: processedParams.image_count as number,
    orientation: processedParams.orientation as
      | 'square'
      | 'landscape'
      | 'portrait',
    tool: style.tool as keyof typeof import('./lib/magic-hour').AI_IMAGE_TOOLS,
  });
  return result.id;
}

async function executeAIGifCreator(
  parameters: Record<string, unknown>
): Promise<string> {
  const processedParams = await processFileParameters(parameters, true);
  const style = (processedParams.style as Record<string, unknown>) || {};
  const result = await generateAIGif({
    prompt: style.prompt as string,
  });
  return result.id;
}

async function executeAIHeadshotGenerator(
  parameters: Record<string, unknown>
): Promise<string> {
  const processedParams = await processFileParameters(parameters, true);
  const style = (processedParams.style as Record<string, unknown>) || {};
  const assets = (processedParams.assets as Record<string, unknown>) || {};
  const result = await generateAIHeadshot({
    imageUrl: assets.image_file_path as string,
    prompt: style.prompt as string,
  });
  return result.id;
}

async function executeAIMemeGenerator(
  parameters: Record<string, unknown>
): Promise<string> {
  const processedParams = await processFileParameters(parameters, true);
  const style = (processedParams.style as Record<string, unknown>) || {};
  const result = await generateAIMeme({
    topic: style.topic as string,
    template: style.template as string,
    searchWeb: style.searchWeb as boolean,
  });
  return result.id;
}

async function executeImageBackgroundRemover(
  parameters: Record<string, unknown>
): Promise<string> {
  const processedParams = await processFileParameters(parameters, true);
  const assets = (processedParams.assets as Record<string, unknown>) || {};
  const result = await removeImageBackground({
    imageUrl: assets.image_file_path as string,
    backgroundImageUrl: assets.background_image_file_path as string,
  });
  return result.id;
}

async function executeFaceSwapPhoto(
  parameters: Record<string, unknown>
): Promise<string> {
  const processedParams = await processFileParameters(parameters, true);
  const assets = (processedParams.assets as Record<string, unknown>) || {};
  const result = await swapFaces({
    targetImageUrl: assets.target_file_path as string,
    sourceImageUrl: assets.source_file_path as string,
    faceSwapMode: assets.face_swap_mode as 'all-faces' | 'individual-faces',
  });
  return result.id;
}

async function executeAIClothesChanger(
  parameters: Record<string, unknown>
): Promise<string> {
  const processedParams = await processFileParameters(parameters, true);
  const assets = (processedParams.assets as Record<string, unknown>) || {};
  const result = await changeClothes({
    personImageUrl: assets.person_file_path as string,
    garmentImageUrl: assets.garment_file_path as string,
    garmentType: assets.garment_type as
      | 'upper_body'
      | 'lower_body'
      | 'full_body',
  });
  return result.id;
}

// Unified tool execution function
export const executeTool = withUserIdAuth(
  async (
    email: string,
    toolId: string,
    toolCredits: number,
    parameters: Record<string, unknown>
  ) => {
    const user = getOrCreateDbUser(email);
    const availableCredits = user.available_credits;

    // Check if user has enough credits
    if (availableCredits < toolCredits) {
      throw new Error(
        `Insufficient credits. You have ${availableCredits} credits but need ${toolCredits} credits to use this tool. Please purchase more credits.`
      );
    }

    let result: string | null = null;

    try {
      // Execute the appropriate tool based on toolId
      switch (toolId) {
        case 'gemini-ai-image-editor':
          result = await executeGeminiImageEditor(parameters);
          break;
        case 'ai-image-generator':
          result = await executeAIImageGenerator(parameters);
          break;
        case 'ai-gif-creator':
          result = await executeAIGifCreator(parameters);
          break;
        case 'ai-headshot-generator':
          result = await executeAIHeadshotGenerator(parameters);
          break;
        case 'ai-meme-generator':
          result = await executeAIMemeGenerator(parameters);
          break;
        case 'image-background-remover':
          result = await executeImageBackgroundRemover(parameters);
          break;
        case 'face-swap-photo':
          result = await executeFaceSwapPhoto(parameters);
          break;
        case 'ai-clothes-changer':
          result = await executeAIClothesChanger(parameters);
          break;
        default:
          throw new Error(`Unsupported tool: ${toolId}`);
      }
    } catch (error) {
      console.error(`Failed to execute tool ${toolId}:`, error);
      throw error;
    }

    // Tool execution successful - deduct credits
    if (result) {
      try {
        deductDbUserCredits(user.email, toolCredits);
        console.log(
          `Credits deducted successfully for ${toolId}. Remaining credits: ${
            availableCredits - toolCredits
          }`
        );
      } catch (creditError) {
        console.error('Failed to deduct credits:', creditError);
      }
    }

    return result;
  }
);

// Legacy function for backward compatibility
export const generateImage = withUserIdAuth(
  async (
    email: string,
    prompt: string,
    referenceImage?: string | null,
    temperature = 0.7
  ) => {
    const user = getOrCreateDbUser(email);
    const availableCredits = user.available_credits;

    if (availableCredits < 1) {
      throw new Error(
        `Insufficient credits. You have ${availableCredits} credits but need 1 credit to generate an image. Please purchase more credits.`
      );
    }

    let imageUrl: string | null = null;
    try {
      imageUrl = await generateGeminiImage(
        prompt,
        referenceImage,
        Number(temperature)
      );
    } catch (error) {
      console.error('Failed to generate image:', error);
      throw error;
    }

    // Image generation successful - deduct credits
    if (imageUrl) {
      try {
        deductDbUserCredits(user.email, 1);
        console.log(
          `Credits deducted successfully. Remaining credits: ${
            availableCredits - 1
          }`
        );
      } catch (creditError) {
        console.error('Failed to deduct credits:', creditError);
      }
    }
    return imageUrl;
  }
);

// Insert image into the target document based on context
export const insertImageToTarget = (imageData: string): void => {
  const context = getScriptContext();

  switch (context) {
    case 'docs':
      insertImageToDoc(imageData);
      break;
    case 'sheets':
      insertImageToSheet(imageData);
      break;
    case 'slides':
      insertImageToSlide(imageData);
      break;
    default:
      throw new Error(`Unsupported context: ${context}`);
  }
};
