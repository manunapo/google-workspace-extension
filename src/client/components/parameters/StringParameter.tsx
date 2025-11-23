import * as React from 'react';
import { Edit3, Zap } from 'lucide-react';
import Textarea from '../ui/textarea';
import type { OnboardingStep } from '../../hooks/useOnboarding';
import {
  editPrompts,
  createPrompts,
  gifPrompts,
  headshotPrompts,
  memePrompts,
  backgroundPrompts,
  faceSwapPrompts,
  clothesPrompts,
  Prompt,
} from '../../../config';

interface StringParameterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
  toolId?: string;
  onPromptSelect?: (prompt: Prompt) => void; // Callback for when a full prompt is selected
  isOnboardingActive?: boolean;
  onboardingStep?: OnboardingStep;
  onSetOnboardingTarget?: (element: HTMLElement | null) => void;
  onOnboardingNext?: (step: OnboardingStep) => void;
}

const StringParameter: React.FC<StringParameterProps> = ({
  label,
  value,
  onChange,
  required = false,
  placeholder,
  multiline = false,
  disabled = false,
  toolId,
  onPromptSelect,
  isOnboardingActive,
  onboardingStep,
  onSetOnboardingTarget,
  onOnboardingNext,
}) => {
  const inputId = React.useId();

  // Ref for the 2nd quick start button (index 1)
  const secondQuickStartRef = React.useRef<HTMLButtonElement>(null);

  // Get appropriate prompts based on tool ID
  const getPromptsForTool = (id?: string) => {
    if (!id) return [];

    switch (id) {
      case 'gemini-ai-image-editor':
        return editPrompts;
      case 'ai-image-generator':
        return createPrompts;
      case 'ai-gif-creator':
        return gifPrompts;
      case 'ai-headshot-generator':
        return headshotPrompts;
      case 'ai-meme-generator':
        return memePrompts;
      case 'image-background-remover':
        return backgroundPrompts;
      case 'face-swap-photo':
        return faceSwapPrompts;
      case 'ai-clothes-changer':
        return clothesPrompts;
      default:
        return [];
    }
  };

  const quickPrompts = getPromptsForTool(toolId);
  const showQuickPrompts = multiline && quickPrompts.length > 0;

  // Set onboarding target when on select-quickstart step
  React.useEffect(() => {
    if (
      isOnboardingActive &&
      onboardingStep === 'select-quickstart' &&
      toolId === 'ai-image-generator'
    ) {
      // Small delay to ensure the DOM is ready
      const timeout = setTimeout(() => {
        if (secondQuickStartRef.current) {
          onSetOnboardingTarget?.(secondQuickStartRef.current);
        }
      }, 50);
      return () => clearTimeout(timeout);
    }
    if (onboardingStep !== 'select-quickstart') {
      onSetOnboardingTarget?.(null);
    }
    return undefined;
  }, [isOnboardingActive, onboardingStep, toolId, onSetOnboardingTarget]);

  const handlePromptSelect = (selectedPrompt: Prompt) => {
    // Set the prompt text
    onChange(selectedPrompt.prompt);

    // If there's a callback for handling full prompt selection, call it
    if (onPromptSelect) {
      onPromptSelect(selectedPrompt);
    }

    // Advance onboarding if active
    if (isOnboardingActive && onboardingStep === 'select-quickstart') {
      onOnboardingNext?.('generate-image');
    }
  };

  return (
    <div className="space-y-3">
      {/* Quick Prompts Section */}
      {showQuickPrompts && (
        <div className="bg-white">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-medium text-gray-800">Quick Start</h3>
          </div>
          <div className="space-y-2">
            {quickPrompts.map((quickPrompt, index) => (
              <button
                key={quickPrompt.id}
                ref={index === 1 ? secondQuickStartRef : undefined}
                onClick={() => handlePromptSelect(quickPrompt)}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 border border-gray-200 rounded-lg transition-all duration-200 text-left group h-12"
                disabled={disabled}
                type="button"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Edit3 className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-gray-700 group-hover:text-purple-700">
                  {quickPrompt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-800"
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        </div>

        {multiline ? (
          <Textarea
            id={inputId}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="resize-y min-h-[120px] max-h-[200px] border-gray-200 focus:border-blue-400 focus:ring-blue-400"
            disabled={disabled}
            required={required}
          />
        ) : (
          <input
            id={inputId}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
        )}
      </div>
    </div>
  );
};

export default StringParameter;
