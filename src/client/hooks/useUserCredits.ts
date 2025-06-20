import { useState, useEffect, useCallback } from 'react';
import { serverFunctions } from '../utils/serverFunctions';
import { useToast } from './useToast';

// Database response interface (snake_case)
interface DatabaseUserCredits {
  available_credits: number;
}

// Client interface (camelCase for better UX)
export interface UserCredits {
  availableCredits: number;
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
  };
}

export const useUserCredits = (shouldStartLoading: boolean = false) => {
  const [state, setState] = useState<UserCreditsState>({
    credits: null,
    loading: shouldStartLoading,
    error: null,
  });

  const { showError } = useToast();

  const fetchCredits = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Note: Even though the server function is now synchronous (using UrlFetchApp),
      // gas-client still wraps it as a Promise for the client-side interface
      const dbCredits = await serverFunctions.getUserCredits();

      // Convert database format to client format
      const clientCredits = convertCreditsToClientFormat(dbCredits);

      setState({
        credits: clientCredits,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch user credits';

      setState({
        credits: null,
        loading: false,
        error: errorMessage,
      });
      showError(errorMessage);
    }
  }, [showError]);

  const refreshCredits = useCallback(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Synchronous version that uses already-fetched credits
  const hasEnoughCredits = useCallback(
    (requiredCredits: number = 1): boolean => {
      if (state.loading || state.error || !state.credits) {
        return false; // Assume no credits if loading, error, or no data
      }
      return state.credits.availableCredits >= requiredCredits;
    },
    [state.loading, state.error, state.credits]
  );

  const getCreditsDisplay = useCallback((): string => {
    if (state.loading) return '--';
    if (state.error || !state.credits) return '--';
    return state.credits.availableCredits.toString();
  }, [state.loading, state.error, state.credits]);

  // Auto-fetch credits when userId is provided
  useEffect(() => {
    fetchCredits();
  }, []);

  return {
    ...state,
    fetchCredits,
    refreshCredits,
    hasEnoughCredits,
    getCreditsDisplay,
  };
};
