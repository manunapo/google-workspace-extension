/* eslint-disable no-console */
import { insertImageToDoc } from './documents';
import { generateGeminiImage } from './lib/gemini';
import { MAGIC_HOUR_TOOLS, processWithMagicHour } from './lib/magic-hour';
import {
  addDbUserCredits,
  deductDbUserCredits,
  getOrCreateDbUser,
  hasClaimedReviewCredits,
  logActivity,
  User,
} from './lib/supabase';
import { insertImageToSlide } from './slides';
import getUserEmail from './session';
import { insertImageToSheet } from './spreadsheets';
import { getScriptContext } from './ui';
import {
  CloudinaryUploadOptions,
  uploadImageToCloudinary,
} from './lib/cloudinary';
import { DEFAULT_REVIEW_CREDITS } from '../constants';
import {
  createCheckoutSession,
  createBillingPortalSession,
} from './lib/getstyled';

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

export const getUserCredits = withUserIdAuth((email: string): User => {
  return getOrCreateDbUser(email);
});

export const checkReviewCreditsStatus = withUserIdAuth(
  (email: string): { canClaim: boolean } => {
    const user = getOrCreateDbUser(email);
    const canClaim = !hasClaimedReviewCredits(user.id);
    return { canClaim };
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

      // Log TOOL_EXECUTION_NOK activity
      logActivity(
        user.id,
        'TOOL_EXECUTION_NOK',
        `Tool ${toolId} failed with parameters: ${JSON.stringify(
          parameters
        )} error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );

      throw error;
    }

    // Tool execution successful - deduct credits
    if (result) {
      // Log TOOL_EXECUTION_OK activity
      logActivity(
        user.id,
        'TOOL_EXECUTION_OK',
        `Tool ${toolId} executed successfully. Credits used: ${toolCredits}. Parameters: ${JSON.stringify(
          parameters
        )}`
      );

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
    const user = getOrCreateDbUser(email);

    try {
      const result = await uploadImageToCloudinary(imageData, options);

      // Log UPLOAD_IMAGE_OK activity
      logActivity(
        user.id,
        'UPLOAD_IMAGE_OK',
        `Image uploaded to Cloudinary: ${result.public_id}`
      );

      return result.secure_url;
    } catch (error) {
      // Log UPLOAD_IMAGE_NOK activity
      logActivity(
        user.id,
        'UPLOAD_IMAGE_NOK',
        `Image upload failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );

      throw error;
    }
  }
);

// Grant review credits to user (one-time only)
export const grantReviewCredits = withUserIdAuth(
  (email: string): { success: boolean; message: string; credits?: number } => {
    // Ensure user exists
    const user = getOrCreateDbUser(email);

    try {
      // Check if user has already claimed review credits
      if (hasClaimedReviewCredits(user.id)) {
        return {
          success: false,
          message: 'Review credits have already been claimed for this account.',
        };
      }

      // Grant review credits
      const updatedCredits = addDbUserCredits(email, DEFAULT_REVIEW_CREDITS);

      // Log GRANT_REVIEW_CREDITS activity
      logActivity(
        user.id,
        'GRANT_REVIEW_CREDITS',
        `User granted ${DEFAULT_REVIEW_CREDITS} review credits. New balance: ${updatedCredits.available_credits}`
      );

      return {
        success: true,
        message: `${DEFAULT_REVIEW_CREDITS} review credits added to your account!`,
        credits: updatedCredits.available_credits,
      };
    } catch (error) {
      console.error('Failed to grant review credits:', error);

      // Log failed attempt
      logActivity(
        user.id,
        'GRANT_REVIEW_CREDITS_FAILED',
        `Failed to grant review credits: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );

      throw new Error(
        `Failed to grant review credits: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
);

// Purchase credits via Stripe checkout
export const purchaseCredits = withUserIdAuth(
  (
    email: string,
    credits: number
  ): { success: boolean; checkoutUrl?: string; error?: string } => {
    // Ensure user exists
    const user = getOrCreateDbUser(email);

    try {
      // Create checkout session
      const result = createCheckoutSession(email, credits);

      if (result.success) {
        // Log PURCHASE_CREDITS_INITIATED activity
        logActivity(
          user.id,
          'PURCHASE_CREDITS_INITIATED',
          `User initiated purchase of ${credits} credits`
        );
      } else {
        // Log failed attempt
        logActivity(
          user.id,
          'PURCHASE_CREDITS_FAILED',
          `Failed to initiate purchase: ${result.error}`
        );
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      console.error('Failed to purchase credits:', error);

      // Log failed attempt
      logActivity(
        user.id,
        'PURCHASE_CREDITS_FAILED',
        `Failed to initiate purchase: ${errorMessage}`
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
);

// Open billing portal for subscription management
export const openBillingPortal = withUserIdAuth(
  (email: string): { success: boolean; portalUrl?: string; error?: string } => {
    // Ensure user exists
    const user = getOrCreateDbUser(email);

    try {
      // Create billing portal session
      const result = createBillingPortalSession(email);

      if (result.success) {
        // Log BILLING_PORTAL_OPENED activity
        logActivity(
          user.id,
          'BILLING_PORTAL_OPENED',
          'User opened billing portal'
        );
      } else {
        // Log failed attempt
        logActivity(
          user.id,
          'BILLING_PORTAL_FAILED',
          `Failed to open billing portal: ${result.error}`
        );
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      console.error('Failed to open billing portal:', error);

      // Log failed attempt
      logActivity(
        user.id,
        'BILLING_PORTAL_FAILED',
        `Failed to open billing portal: ${errorMessage}`
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
);
