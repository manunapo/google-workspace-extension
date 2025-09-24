/* eslint-disable no-console */
import { insertImageToDoc } from './documents';
import { generateGeminiImage } from './lib/gemini';
import { MAGIC_HOUR_TOOLS, processWithMagicHour } from './lib/magic-hour';
import { deductDbUserCredits, getOrCreateDbUser, User } from './lib/supabase';
import { insertImageToSlide } from './slides';
import getUserEmail from './session';
import { insertImageToSheet } from './spreadsheets';
import { getScriptContext } from './ui';
import {
  CloudinaryUploadOptions,
  uploadImageToCloudinary,
} from './lib/cloudinary';

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

// Unified tool execution function
export const executeTool = withUserIdAuth(
  async (
    email: string,
    toolId: string,
    toolCredits: number,
    parameters: Record<string, unknown>
  ) => {
    console.log('Executing tool with parameters:', parameters);
    const user = getOrCreateDbUser(email);
    const availableCredits = user.available_credits;

    // Check if user has enough credits
    if (availableCredits < toolCredits) {
      throw new Error(
        `Insufficient credits. You have ${availableCredits} credits but need ${toolCredits} credits to use this tool. Please purchase more credits.`
      );
    }

    let result: string | null = null;
    const creationName = `${email.split('@')[0]}_${toolId}_${Date.now()}`;

    try {
      // Execute the appropriate tool based on toolId
      if (toolId === 'gemini-ai-image-editor') {
        result = await generateGeminiImage(
          parameters.prompt as string,
          parameters.referenceImage as string,
          Number(parameters.temperature || 0.7)
        );
      } else {
        result = await processWithMagicHour({
          tool: toolId as keyof typeof MAGIC_HOUR_TOOLS,
          ...parameters,
          name: creationName,
        });
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

// Convenience function to upload and get just the URL
export const uploadImageAndGetUrl = withUserIdAuth(
  async (
    email: string,
    imageData: string,
    options: CloudinaryUploadOptions = {}
  ): Promise<string> => {
    console.log(email);
    const result = await uploadImageToCloudinary(imageData, options);
    return result.secure_url;
  }
);
