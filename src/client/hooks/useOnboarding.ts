import { useState, useEffect, useCallback } from 'react';

export type OnboardingStep =
  | 'select-tool' // Step 1: Select AI Image Generator
  | 'select-quickstart' // Step 2: Click Quick Start preset
  | 'generate-image' // Step 3: Click Generate Image button
  | 'insert-download' // Step 4: Click Insert or Download
  | 'complete'; // Onboarding completed

interface OnboardingState {
  isActive: boolean;
  currentStep: OnboardingStep;
}

const STORAGE_KEY = 'gpt-ai-image-generator-onboarding-completed';

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    isActive: false,
    currentStep: 'select-tool',
  });

  // Check if onboarding has been completed
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Start onboarding if not completed
      setState({
        isActive: true,
        currentStep: 'select-tool',
      });
    }
  }, []);

  // Skip/close onboarding
  const skipOnboarding = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setState({
      isActive: false,
      currentStep: 'complete',
    });
  }, []);

  // Move to next step
  const nextStep = useCallback((step: OnboardingStep) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
    }));

    // If reaching complete, mark as done
    if (step === 'complete') {
      localStorage.setItem(STORAGE_KEY, 'true');
      setState({
        isActive: false,
        currentStep: 'complete',
      });
    }
  }, []);

  // Reset onboarding (for testing or re-enabling)
  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      isActive: true,
      currentStep: 'select-tool',
    });
  }, []);

  return {
    isOnboardingActive: state.isActive,
    currentStep: state.currentStep,
    skipOnboarding,
    nextStep,
    resetOnboarding,
  };
}
