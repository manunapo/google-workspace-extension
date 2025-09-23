/* eslint-disable no-console */
import { insertImageToDoc } from './documents';
import { generateGeminiImage } from './lib/gemini';
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

export const generateImage = withUserIdAuth(
  async (
    email: string,
    prompt: string,
    referenceImage?: string | null,
    temperature = 0.7
  ) => {
    const user = getOrCreateDbUser(email);
    const credits = user.available_credits;
    const availableCredits = credits;

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
