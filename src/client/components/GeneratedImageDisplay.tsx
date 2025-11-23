import * as React from 'react';
import { Download, FileImage, Sparkles } from 'lucide-react';
import type { OnboardingStep } from '../hooks/useOnboarding';
import { Button } from './ui/button';
import { serverFunctions } from '../utils/serverFunctions';
import { useToast } from '../hooks/useToast';
import { resizeImageForSheets } from '../utils/images';

interface GeneratedImageDisplayProps {
  imageData: string;
  className?: string;
  isOnboardingActive?: boolean;
  onboardingStep?: OnboardingStep;
  onSetOnboardingTarget?: (element: HTMLElement | null) => void;
  onOnboardingNext?: (step: OnboardingStep) => void;
}

const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({
  imageData,
  className,
  isOnboardingActive,
  onboardingStep,
  onSetOnboardingTarget,
  onOnboardingNext,
}) => {
  const { showSuccess, showError } = useToast();
  const [isInserting, setIsInserting] = React.useState(false);

  // Refs for onboarding
  const insertButtonRef = React.useRef<HTMLButtonElement>(null);

  // Set onboarding target when on insert-download step
  React.useEffect(() => {
    if (isOnboardingActive && onboardingStep === 'insert-download') {
      // Small delay to ensure the DOM is ready
      const timeout = setTimeout(() => {
        if (insertButtonRef.current) {
          onSetOnboardingTarget?.(insertButtonRef.current);
        }
      }, 50);
      return () => clearTimeout(timeout);
    }
    if (onboardingStep !== 'insert-download') {
      onSetOnboardingTarget?.(null);
    }
    return undefined;
  }, [isOnboardingActive, onboardingStep, onSetOnboardingTarget]);

  // Utility function to get file extension from MIME type
  const getFileExtension = (dataUrl: string): string => {
    if (dataUrl.startsWith('data:image/gif')) return 'gif';
    if (dataUrl.startsWith('data:image/png')) return 'png';
    if (dataUrl.startsWith('data:image/jpeg')) return 'jpg';
    if (dataUrl.startsWith('data:image/webp')) return 'webp';
    return 'png'; // default fallback
  };

  const handleDownload = () => {
    // Complete onboarding if active
    if (isOnboardingActive && onboardingStep === 'insert-download') {
      onOnboardingNext?.('complete');
    }

    try {
      const fileExtension = getFileExtension(imageData);

      // Create a temporary link element with the base64 data
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `ai-generated-image-${Date.now()}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess('Image downloaded successfully!');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to download image';
      showError(errorMessage);
    }
  };

  const handleInsertToDocument = async () => {
    // Complete onboarding if active
    if (isOnboardingActive && onboardingStep === 'insert-download') {
      onOnboardingNext?.('complete');
    }

    try {
      setIsInserting(true);

      // Resize image for Google Sheets compatibility
      const resizedImageData = await resizeImageForSheets(imageData);

      await serverFunctions.insertImageToTarget(resizedImageData);
      showSuccess('Image inserted successfully!');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to insert image';
      showError(errorMessage);
    } finally {
      setIsInserting(false);
    }
  };

  return (
    <div className={`bg-white overflow-hidden ${className}`}>
      {/* Image Display */}
      <div className="border-t border-gray-200 p-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <h3 className="text-sm font-medium text-gray-700">
            Last Generated Image
          </h3>
        </div>
        <div className="relative group">
          <img
            src={imageData}
            alt="AI Generated"
            className="w-full rounded-lg shadow-md border border-gray-200 transition-transform group-hover:scale-[1.02]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={handleInsertToDocument}
            ref={insertButtonRef}
            disabled={isInserting}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
          >
            {isInserting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Inserting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4" />
                <span>Insert to Document</span>
              </div>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            className="px-4 hover:bg-gray-50 border-gray-300"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* Tips */}
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">Pro tip:</p>
              <p>
                Once you have a generated image, use the shortcut "Add generated
                image" to add it as source for any tool!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedImageDisplay;
