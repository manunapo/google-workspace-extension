import { generateOpenAIImage } from './lib/openai';
import { deductDbUserCredits, getDbUserCredits } from './lib/supabase';
import { getUserProperties, setUserProperties } from './properties';
import getUserEmail from './session';

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

export const getUserCredits = withUserIdAuth((userId: string) => {
  const creditsProperty = getUserProperties('free_credits');
  if (creditsProperty === null) {
    console.log(
      `New user ${userId} has no free credits, giving 2 free credits`
    );
    setUserProperties('free_credits', '2');
  }
  const freeCredits = parseInt(getUserProperties('free_credits'), 10);
  if (freeCredits > 0) {
    console.log(
      `User ${userId} has ${freeCredits} free credits from properties`
    );
  }

  const dbCredits = getDbUserCredits(userId);
  return {
    available_credits: freeCredits + (dbCredits?.available_credits || 0),
  };
});

export const generateImage = withUserIdAuth(
  async (
    userId: string,
    prompt: string,
    referenceImage?: string | null,
    transparentBackground = false,
    temperature = 0.7
  ) => {
    const freeCredits = parseInt(getUserProperties('free_credits') || '0', 10);
    let availableCredits = freeCredits;
    let usingFreeCredits = true;
    if (freeCredits < 1) {
      const dbCredits = getDbUserCredits(userId);
      availableCredits = dbCredits?.available_credits || 0;
      usingFreeCredits = false;
    }

    if (availableCredits < 1) {
      throw new Error(
        `Insufficient credits. You have ${availableCredits} credits but need 1 credit to generate an image. Please purchase more credits.`
      );
    }

    const imageUrl = await generateOpenAIImage(
      prompt,
      referenceImage,
      Boolean(transparentBackground),
      Number(temperature)
    );

    // Image generation successful - deduct credits
    if (imageUrl) {
      try {
        if (usingFreeCredits) {
          setUserProperties('free_credits', (freeCredits - 1).toString());
        } else {
          const updatedCredits = deductDbUserCredits(userId, 1);
          setUserProperties(
            'free_credits',
            updatedCredits.available_credits.toString()
          );
        }
        console.log(
          `Credits deducted successfully. Remaining credits: ${
            availableCredits - 1
          }`
        );
      } catch (creditError) {
        console.error('Failed to deduct credits:', creditError);
        // We'll still return the image since generation was successful
        // but log the credit deduction failure
      }
    }
    return imageUrl;
  }
);
