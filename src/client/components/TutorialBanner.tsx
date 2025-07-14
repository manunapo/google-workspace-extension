import * as React from 'react';
import { X, Play } from 'lucide-react';
import { serverFunctions } from '../utils/serverFunctions';

const TUTORIAL_DISMISSED_KEY = 'gpt-ai-image-generator-tutorial-dismissed';

const TutorialBanner: React.FC = () => {
  const [showTutorial, setShowTutorial] = React.useState(() => {
    // Check if tutorial was previously dismissed
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const dismissed = localStorage.getItem(TUTORIAL_DISMISSED_KEY);
        return dismissed !== 'true';
      }
    } catch (error) {
      // Fallback if localStorage is not available
    }
    return true;
  });

  const handleDismissTutorial = React.useCallback((e: React.MouseEvent) => {
    console.log('Dismiss tutorial clicked');
    e.stopPropagation(); // Prevent event bubbling to parent div
    setShowTutorial(false);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(TUTORIAL_DISMISSED_KEY, 'true');
      }
    } catch (error) {
      // Handle localStorage errors gracefully
    }
  }, []);

  const handleOpenTutorial = React.useCallback(() => {
    console.log('Open tutorial clicked');
    serverFunctions.openTutorialDialog();
  }, []);

  if (!showTutorial) {
    return null;
  }

  return (
    <div className="mx-4 mb-2 p-1 relative bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg shadow-sm">
      <button
        onClick={handleDismissTutorial}
        className="absolute top-2 right-2 z-10 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss tutorial"
        type="button"
      >
        <X className="w-4 h-4" />
      </button>
      <div
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity pr-6"
        onClick={(e) => {
          // Only trigger if the click is not on the dismiss button area
          if (
            e.target !== e.currentTarget &&
            (e.target as HTMLElement).closest('button')
          ) {
            return;
          }
          handleOpenTutorial();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenTutorial();
          }
        }}
      >
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Play className="w-4 h-4 text-blue-600 ml-0.5" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-gray-800">
            New to GPT Image Generator?
          </h3>
          <p className="text-[10px] text-gray-600">
            Watch our quick tutorial to get started
          </p>
        </div>
      </div>
    </div>
  );
};

export default TutorialBanner;
