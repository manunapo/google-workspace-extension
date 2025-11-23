/* eslint-disable no-console */
import { getScriptProperties } from '../properties';
import { GETSTYLED_API_KEY } from '../../constants';

const GETSTYLED_API_BASE_URL = 'https://www.getstyled.art/api/extension';
// const GETSTYLED_API_BASE_URL = 'https://8q15ztzz-3000.brs.devtunnels.ms/api/extension';

interface CheckoutSessionResponse {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
}

interface BillingPortalResponse {
  success: boolean;
  portalUrl?: string;
  error?: string;
}

/**
 * Get GetStyled API key from script properties
 */
function getApiKey(): string {
  const apiKey = getScriptProperties(GETSTYLED_API_KEY);
  if (!apiKey) {
    throw new Error('GetStyled API key not configured');
  }
  return apiKey;
}

/**
 * Create a Stripe checkout session for purchasing credits
 * @param email - User's email address
 * @param credits - Number of credits to purchase (150 for Essential, 500 for Pro)
 * @returns Checkout session response with URL or error
 */
export function createCheckoutSession(
  email: string,
  credits: number
): CheckoutSessionResponse {
  try {
    const apiKey = getApiKey();
    const url = `${GETSTYLED_API_BASE_URL}/checkout`;

    const payload = {
      email,
      credits,
    };

    console.log(
      `Creating checkout session for ${email} with ${credits} credits`
    );

    const response = UrlFetchApp.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    console.log(`Checkout API response code: ${responseCode}`);

    if (responseCode === 200) {
      const data = JSON.parse(responseText);
      return {
        success: true,
        checkoutUrl: data.checkoutUrl,
      };
    }
    // Handle error responses
    let errorMessage = 'Failed to create checkout session';

    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If response is not JSON, use generic error
    }

    if (responseCode === 401) {
      errorMessage = 'Configuration error. Please contact support.';
    } else if (responseCode === 404) {
      errorMessage = 'Account not found. Please try again.';
    } else if (responseCode === 400) {
      errorMessage = 'Invalid request. Please contact support.';
    }

    console.error(`Checkout session error: ${errorMessage}`);

    return {
      success: false,
      error: errorMessage,
    };
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unable to connect. Please try again.',
    };
  }
}

/**
 * Create a Stripe billing portal session for managing subscriptions
 * @param email - User's email address
 * @returns Billing portal response with URL or error
 */
export function createBillingPortalSession(
  email: string
): BillingPortalResponse {
  try {
    const apiKey = getApiKey();
    const url = `${GETSTYLED_API_BASE_URL}/billing-portal`;

    const payload = {
      email,
    };

    console.log(`Creating billing portal session for ${email}`);

    const response = UrlFetchApp.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    console.log(`Billing portal API response code: ${responseCode}`);

    if (responseCode === 200) {
      const data = JSON.parse(responseText);
      return {
        success: true,
        portalUrl: data.portalUrl,
      };
    }
    // Handle error responses
    let errorMessage = 'Failed to open billing portal';

    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If response is not JSON, use generic error
    }

    if (responseCode === 401) {
      errorMessage = 'Configuration error. Please contact support.';
    } else if (responseCode === 404) {
      errorMessage = 'Account not found. Please try again.';
    } else if (responseCode === 400) {
      errorMessage = 'Invalid request. Please contact support.';
    }

    console.error(`Billing portal error: ${errorMessage}`);

    return {
      success: false,
      error: errorMessage,
    };
  } catch (error) {
    console.error('Failed to create billing portal session:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unable to connect. Please try again.',
    };
  }
}
