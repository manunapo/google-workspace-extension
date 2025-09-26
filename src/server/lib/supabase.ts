import { getScriptProperties } from '../properties';
import { DEFAULT_FREE_CREDITS } from '../../constants';

// Types based on the database schema
export interface User {
  id: string;
  name?: string;
  email: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  stripe_customer_id?: string;
  available_credits: number;
  total_purchased_credits: number;
  last_purchase_date?: string;
  referrer?: string;
  source: string;
}

export interface UserCredits {
  available_credits: number;
}

export interface ActivityLog {
  id?: number;
  userId: string;
  action: string;
  context?: string;
  timestamp?: string;
  ipAddress?: string;
}

// Configuration
interface SupabaseConfig {
  url: string;
  apiKey: string;
}

/**
 * Get Supabase configuration or throw error if not initialized
 */
function getConfig(): SupabaseConfig {
  const supabaseConfig: SupabaseConfig = {
    url: 'https://rjogoexdzfuwqzxdccic.supabase.co/rest/v1',
    apiKey: getScriptProperties('SUPABASE_API_KEY') || '',
  };
  if (!supabaseConfig.apiKey) {
    throw new Error(
      'Supabase not properly configured. Check SUPABASE_API_KEY.'
    );
  }
  return supabaseConfig;
}

/**
 * Create headers for Supabase API requests
 */
function createHeaders(): Record<string, string> {
  const config = getConfig();
  return {
    apikey: config.apiKey,
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

/**
 * Handle UrlFetch response and throw error if not successful
 */
function handleResponse<T>(
  response: GoogleAppsScript.URL_Fetch.HTTPResponse
): T {
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (responseCode < 200 || responseCode >= 300) {
    let errorMessage = `HTTP ${responseCode}: Request failed`;

    try {
      const errorJson = JSON.parse(responseText);
      errorMessage = errorJson.message || errorJson.hint || errorMessage;
    } catch {
      // If not JSON, use the response text as is
      if (responseText) {
        errorMessage = responseText;
      }
    }

    throw new Error(`Supabase API Error: ${errorMessage}`);
  }

  if (!responseText) {
    return {} as T;
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    throw new Error(`Failed to parse response JSON: ${error}`);
  }
}

/**
 * Log user activity to the database
 * @param userId - The user ID (email) to log activity for
 * @param action - The action being performed (NEW_USER, UPLOAD_IMAGE, TOOL_EXECUTION_OK, TOOL_EXECUTION_NOK)
 * @param context - Optional context information about the action
 */
export function logActivity(
  userId: string,
  action: string,
  context?: string
): void {
  try {
    const config = getConfig();
    const url = `${config.url}/activity_logs`;

    const activityData = {
      user_id: userId,
      action,
      context: context || null,
    };

    UrlFetchApp.fetch(url, {
      method: 'POST',
      headers: createHeaders(),
      payload: JSON.stringify(activityData),
    });

    // We don't handle the response or throw errors here to ensure
    // activity logging doesn't break core functionality
  } catch (error) {
    // Silently fail - activity logging should not break core functionality
    console.error('Failed to log activity:', error);
  }
}

/**
 * Get user credits by user ID
 * @param userId - The user ID to get credits for
 * @returns Promise with user credits information
 */
function getDbUserCredits(email: string): UserCredits | null {
  const config = getConfig();
  const url = `${config.url}/users?email=eq.${encodeURIComponent(
    email
  )}&select=available_credits`;

  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });

    const users = handleResponse<UserCredits[]>(response);

    if (users.length === 0) {
      return null; // User not found
    }

    return users[0];
  } catch (error) {
    throw new Error(
      `Failed to get user credits: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Create a new user in the database
 * @param email - The user's email address
 * @returns Newly created user information
 */
function createNewUser(email: string): User {
  const config = getConfig();
  const url = `${config.url}/users`;

  // Extract name from email (optional, can be null)
  const name = email.split('@')[0];

  const newUserData = {
    id: email,
    email,
    name,
    available_credits: DEFAULT_FREE_CREDITS,
    source: 'google-addon',
  };

  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'POST',
      headers: createHeaders(),
      payload: JSON.stringify(newUserData),
    });

    const createdUsers = handleResponse<User[]>(response);

    if (createdUsers.length === 0) {
      throw new Error('Failed to create user - no user returned');
    }

    const newUser = createdUsers[0];

    // Log NEW_USER activity
    logActivity(
      newUser.id,
      'NEW_USER',
      `User created with ${DEFAULT_FREE_CREDITS} free credits`
    );

    return newUser;
  } catch (error) {
    throw new Error(
      `Failed to create user: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Get or create user information by user ID
 * @param userId - The user ID (email) to get or create information for
 * @returns User information (either existing or newly created)
 */
export function getOrCreateDbUser(email: string): User {
  const config = getConfig();
  const url = `${config.url}/users?email=eq.${encodeURIComponent(email)}`;

  try {
    // Try to get existing user
    const response = UrlFetchApp.fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });

    const users = handleResponse<User[]>(response);

    if (users.length > 0) {
      return users[0]; // User found, return existing user
    }

    // User not found, create new user
    return createNewUser(email);
  } catch (error) {
    throw new Error(
      `Failed to get or create user: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Update user credits (deduct credits)
 * @param userId - The user ID to update credits for
 * @param creditsToDeduct - Number of credits to deduct (positive number)
 * @returns Promise with updated credits information
 */
export function deductDbUserCredits(
  userId: string,
  creditsToDeduct: number
): UserCredits {
  if (creditsToDeduct < 0) {
    throw new Error('Credits to deduct must be a positive number');
  }

  // First, get current credits to calculate new value
  const currentCredits = getDbUserCredits(userId);
  if (!currentCredits) {
    throw new Error('User not found');
  }

  const newAvailableCredits = Math.max(
    0,
    currentCredits.available_credits - creditsToDeduct
  );

  const config = getConfig();
  const url = `${config.url}/users?email=eq.${encodeURIComponent(userId)}`;

  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'PATCH',
      headers: createHeaders(),
      payload: JSON.stringify({
        available_credits: newAvailableCredits,
        updated_at: new Date().toISOString(),
      }),
    });

    const updatedUsers = handleResponse<User[]>(response);

    if (updatedUsers.length === 0) {
      throw new Error('Failed to update user credits');
    }

    return {
      available_credits: updatedUsers[0].available_credits,
    };
  } catch (error) {
    throw new Error(
      `Failed to deduct user credits: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Add credits to user account
 * @param userId - The user ID to update credits for
 * @param creditsToAdd - Number of credits to add (positive number)
 * @returns Promise with updated credits information
 */
export function addDbUserCredits(
  email: string,
  creditsToAdd: number
): UserCredits {
  if (creditsToAdd <= 0) {
    throw new Error('Credits to add must be a positive number');
  }

  // First, get current credits to calculate new value
  const currentCredits = getDbUserCredits(email);
  if (!currentCredits) {
    throw new Error('User not found');
  }

  const newAvailableCredits = currentCredits.available_credits + creditsToAdd;

  const config = getConfig();
  const url = `${config.url}/users?email=eq.${encodeURIComponent(email)}`;

  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'PATCH',
      headers: createHeaders(),
      payload: JSON.stringify({
        available_credits: newAvailableCredits,
        updated_at: new Date().toISOString(),
      }),
    });

    const updatedUsers = handleResponse<User[]>(response);

    if (updatedUsers.length === 0) {
      throw new Error('Failed to update user credits');
    }

    return {
      available_credits: updatedUsers[0].available_credits,
    };
  } catch (error) {
    throw new Error(
      `Failed to add user credits: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Check if user has already claimed review credits
 * @param userId - The user ID to check
 * @returns boolean indicating if review credits have been claimed
 */
export function hasClaimedReviewCredits(userId: string): boolean {
  try {
    const config = getConfig();
    const url = `${config.url}/activity_logs?user_id=eq.${encodeURIComponent(
      userId
    )}&action=eq.GRANT_REVIEW_CREDITS&limit=1`;

    const response = UrlFetchApp.fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });

    const activities = handleResponse<ActivityLog[]>(response);
    return activities.length > 0;
  } catch (error) {
    // If we can't check, assume they haven't claimed to be safe
    console.error('Failed to check review credits status:', error);
    return false;
  }
}
