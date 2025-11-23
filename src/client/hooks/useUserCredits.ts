import { useCallback, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { serverFunctions } from '../utils/serverFunctions';
import { useToast } from './useToast';

// Database response interface (snake_case)
interface DatabaseUserCredits {
  available_credits: number;
  subscription_status?: string;
  subscription_plan_id?: string;
  stripe_subscription_id?: string;
  current_period_end?: string;
}

// Client interface (camelCase for better UX)
export interface UserCredits {
  availableCredits: number;
  subscriptionStatus?: string;
  subscriptionPlanId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
}

export interface UserCreditsState {
  credits: UserCredits | null;
  loading: boolean;
  error: string | null;
}

// Helper function to convert snake_case to camelCase
function convertCreditsToClientFormat(
  dbCredits: DatabaseUserCredits | null
): UserCredits | null {
  if (!dbCredits) return null;

  return {
    availableCredits: dbCredits.available_credits,
    subscriptionStatus: dbCredits.subscription_status,
    subscriptionPlanId: dbCredits.subscription_plan_id,
    stripeSubscriptionId: dbCredits.stripe_subscription_id,
    currentPeriodEnd: dbCredits.current_period_end,
  };
}

const USER_CREDITS_QUERY_KEY = ['userCredits'] as const;

export const useUserCredits = (shouldStartLoading: boolean = false) => {
  const { showError } = useToast();
  const showErrorRef = useRef(showError);

  // Keep the ref updated
  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);

  // React Query for user credits
  const {
    data: dbCredits,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: USER_CREDITS_QUERY_KEY,
    queryFn: async (): Promise<DatabaseUserCredits> => {
      // Note: Even though the server function is now synchronous (using UrlFetchApp),
      // gas-client still wraps it as a Promise for the client-side interface
      return serverFunctions.getUserCredits();
    },
    enabled: shouldStartLoading, // Only auto-fetch if shouldStartLoading is true
    retry: 2,
    staleTime: 30 * 1000, // 30 seconds - credits change frequently
    gcTime: 2 * 60 * 1000, // 2 minutes cache time
  });

  // Convert database format to client format
  const credits = convertCreditsToClientFormat(dbCredits || null);

  // Convert error to string format for compatibility
  let error: string | null = null;
  if (queryError) {
    error =
      queryError instanceof Error
        ? queryError.message
        : 'Failed to fetch user credits';
  }

  // Create state object for backward compatibility
  const state: UserCreditsState = {
    credits,
    loading: isLoading,
    error,
  };

  // Quiet fetch function (no toast)
  const fetchCreditsQuiet = useCallback(async () => {
    try {
      await refetch();
    } catch (fetchError) {
      // Error is already handled by React Query and stored in state
      // We don't show toast for quiet fetches
    }
  }, [refetch]);

  // Refresh with toast function
  const refreshCredits = useCallback(async () => {
    try {
      await refetch();
    } catch (refreshError) {
      const errorMessage =
        refreshError instanceof Error
          ? refreshError.message
          : 'Failed to refresh user credits';
      showErrorRef.current(errorMessage);
    }
  }, [refetch]);

  // Synchronous version that uses already-fetched credits
  const hasEnoughCredits = useCallback(
    (requiredCredits: number = 1): boolean => {
      if (isLoading || error || !credits) {
        return false; // Assume no credits if loading, error, or no data
      }
      return credits.availableCredits >= requiredCredits;
    },
    [isLoading, error, credits]
  );

  const getCreditsDisplay = useCallback((): string => {
    if (isLoading) return '--';
    if (error || !credits) return '--';
    return credits.availableCredits.toString();
  }, [isLoading, error, credits]);

  return {
    ...state,
    fetchCredits: fetchCreditsQuiet, // Export the quiet version as default
    refreshCredits,
    hasEnoughCredits,
    getCreditsDisplay,
  };
};
