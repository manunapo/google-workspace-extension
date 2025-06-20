/**
 * Supabase REST API Library for User Credits Management
 * Handles getting and updating user credits via Supabase REST API using Google Apps Script UrlFetchApp
 */

import { getScriptProperties } from '../properties';

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
}

export interface UserCredits {
  available_credits: number;
}

// Configuration
interface SupabaseConfig {
  url: string;
  apiKey: string;
}

const supabaseConfig: SupabaseConfig = {
  url: 'https://rjogoexdzfuwqzxdccic.supabase.co/rest/v1',
  apiKey: getScriptProperties('SUPABASE_API_KEY'),
};

/**
 * Get Supabase configuration or throw error if not initialized
 */
function getConfig(): SupabaseConfig {
  if (!supabaseConfig || !supabaseConfig.apiKey) {
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
 * Get user credits by user ID
 * @param userId - The user ID to get credits for
 * @returns Promise with user credits information
 */
export function getDbUserCredits(userId: string): UserCredits | null {
  const config = getConfig();
  const url = `${config.url}/users?email=eq.${encodeURIComponent(
    userId
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
 * Get full user information by user ID
 * @param userId - The user ID to get information for
 * @returns Promise with full user information
 */
export function getDbUser(userId: string): User | null {
  const config = getConfig();
  const url = `${config.url}/users?email=eq.${encodeURIComponent(userId)}`;

  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });

    const users = handleResponse<User[]>(response);

    if (users.length === 0) {
      return null; // User not found
    }

    return users[0];
  } catch (error) {
    throw new Error(
      `Failed to get user: ${
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
