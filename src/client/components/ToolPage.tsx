/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { Coins, Sparkles } from 'lucide-react';
import { Tool, Prompt } from '../../config';
import type { OnboardingStep } from '../hooks/useOnboarding';
import ParameterRenderer from './ParameterRenderer';
import { Button } from './ui/button';
import Spinner from './ui/spinner';
import GeneratedImageDisplay from './GeneratedImageDisplay';
import { useUserCredits } from '../hooks/useUserCredits';
import { useToast } from '../hooks/useToast';
import { useMediaPreloader } from '../utils/mediaPreloader';
import { urlToFile } from '../utils/images';

interface ToolPageProps {
  tool: Tool;
  onExecute: (toolId: string, parameters: Record<string, any>) => Promise<void>;
  isExecuting: boolean;
  generatedImage?: string | null;
  lastGeneratedImage?: string | null;
  isOnboardingActive: boolean;
  onboardingStep: OnboardingStep;
  onSetOnboardingTarget: (element: HTMLElement | null) => void;
  onOnboardingNext: (step: OnboardingStep) => void;
  onShowLowCreditsModal: () => void;
}

// Helper function to check if URL is a webm video
const isWebmVideo = (url: string): boolean => {
  return url.toLowerCase().endsWith('.webm');
};

// Helper function to flatten nested parameter structure
const flattenParameters = (
  params: Record<string, any>
): Record<string, any> => {
  const flattened: Record<string, any> = {};

  const flatten = (obj: Record<string, any>, prefix = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !value.type
      ) {
        flatten(value, fullKey);
      } else {
        flattened[fullKey] = value;
      }
    });
  };

  flatten(params);
  return flattened;
};

// Helper function to unflatten parameters back to nested structure
const unflattenParameters = (
  flattened: Record<string, any>
): Record<string, any> => {
  const result: Record<string, any> = {};

  Object.entries(flattened).forEach(([key, value]) => {
    const parts = key.split('.');
    let current = result;

    for (let i = 0; i < parts.length - 1; i += 1) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;
  });

  return result;
};

// Component to render thumbnail (either image or video)
interface ThumbnailRendererProps {
  src: string;
  alt: string;
  className: string;
}

const ThumbnailRenderer: React.FC<ThumbnailRendererProps> = ({
  src,
  alt,
  className,
}) => {
  const { isMediaReady, hasMediaError } = useMediaPreloader();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  // Check if media is preloaded and ready
  const isPreloaded = isMediaReady(src);
  const preloadError = hasMediaError(src);

  // Reset loading state when src changes
  React.useEffect(() => {
    // If media is already preloaded, set it as loaded immediately
    if (isPreloaded) {
      setIsLoaded(true);
      setHasError(false);
    } else if (preloadError) {
      setIsLoaded(false);
      setHasError(true);
    } else {
      setIsLoaded(false);
      setHasError(false);
    }
  }, [src, isPreloaded, preloadError]);

  const handleLoad = React.useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = React.useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
  }, []);

  if (isWebmVideo(src)) {
    return (
      <>
        {!isLoaded && !hasError && (
          <div
            className={`${className} flex items-center justify-center bg-gradient-to-r from-purple-50 to-blue-50`}
          >
            <div className="text-purple-400 text-2xl">🎨</div>
          </div>
        )}
        <video
          src={src}
          className={`${className} ${isLoaded ? 'block' : 'hidden'}`}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={!isPreloaded ? handleLoad : undefined}
          onError={!isPreloaded ? handleError : undefined}
        />
      </>
    );
  }

  return (
    <>
      {!isLoaded && !hasError && (
        <div
          className={`${className} flex items-center justify-center bg-gradient-to-r from-purple-50 to-blue-50`}
        >
          <div className="text-purple-400 text-2xl">🎨</div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoaded ? 'block' : 'hidden'}`}
        onLoad={!isPreloaded ? handleLoad : undefined}
        onError={!isPreloaded ? handleError : undefined}
      />
    </>
  );
};

const ToolPage: React.FC<ToolPageProps> = ({
  tool,
  onExecute,
  isExecuting,
  generatedImage,
  lastGeneratedImage,
  isOnboardingActive,
  onboardingStep,
  onSetOnboardingTarget,
  onOnboardingNext,
  onShowLowCreditsModal,
}) => {
  const { hasEnoughCredits } = useUserCredits();
  const { showError } = useToast();

  // Ref for auto-scrolling to generated image
  const generatedImageRef = React.useRef<HTMLDivElement>(null);

  // Ref for the generate button (for onboarding)
  const generateButtonRef = React.useRef<HTMLButtonElement>(null);

  // Set onboarding target when on generate-image step
  React.useEffect(() => {
    if (
      isOnboardingActive &&
      onboardingStep === 'generate-image' &&
      generateButtonRef.current &&
      tool.id === 'ai-image-generator'
    ) {
      onSetOnboardingTarget(generateButtonRef.current);
    } else if (onboardingStep !== 'generate-image') {
      onSetOnboardingTarget(null);
    }
  }, [isOnboardingActive, onboardingStep, tool.id, onSetOnboardingTarget]);

  // Move to insert-download step when image is generated
  React.useEffect(() => {
    if (
      isOnboardingActive &&
      onboardingStep === 'generate-image' &&
      generatedImage &&
      tool.id === 'ai-image-generator'
    ) {
      // Delay to allow GeneratedImageDisplay to mount
      const timeout = setTimeout(() => {
        onOnboardingNext('insert-download');
      }, 150);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [
    isOnboardingActive,
    onboardingStep,
    generatedImage,
    tool.id,
    onOnboardingNext,
  ]);

  // Flatten the tool parameters for easier management
  const flattenedParams = React.useMemo(
    () => flattenParameters(tool.parameters),
    [tool.parameters]
  );

  // Track if we've loaded default images
  const [defaultImagesLoaded, setDefaultImagesLoaded] = React.useState<
    Record<string, boolean>
  >({});

  // Initialize form state with default values
  const [formData, setFormData] = React.useState<Record<string, any>>(() => {
    const initialData: Record<string, any> = {};

    Object.entries(flattenedParams).forEach(([key, config]) => {
      if (config && typeof config === 'object' && 'default' in config) {
        initialData[key] = config.default;
      } else {
        initialData[key] = '';
      }
    });

    return initialData;
  });

  // Load default images from tool configuration (only on first load)
  React.useEffect(() => {
    const loadDefaultImages = async () => {
      // Get default image mapping based on tool ID
      const getDefaultImageUrls = (): Record<string, string> => {
        switch (tool.id) {
          case 'gemini-ai-image-editor':
            return {
              referenceImage:
                'https://res.cloudinary.com/dmueochke/image/upload/v1761169868/getstyled/ai-clothes-changer/obama.jpg',
            };
          case 'image-background-remover':
            return {
              'assets.image_file_path':
                'https://res.cloudinary.com/dmueochke/image/upload/v1761169868/getstyled/ai-clothes-changer/obama.jpg',
            };
          case 'ai-headshot-generator':
            return {
              'assets.image_file_path':
                'https://res.cloudinary.com/dmueochke/image/upload/v1761224303/getstyled/ai-headshot-generator/messi_before.jpg',
            };
          case 'face-swap-photo':
            return {
              'assets.source_file_path':
                'https://res.cloudinary.com/dmueochke/image/upload/v1761226665/getstyled/ai-face-swap-photo/preset3.jpg',
              'assets.target_file_path':
                'https://res.cloudinary.com/dmueochke/image/upload/v1761169864/getstyled/ai-clothes-changer/lebron.jpg',
            };
          case 'ai-clothes-changer':
            return {
              'assets.person_file_path':
                'https://res.cloudinary.com/dmueochke/image/upload/v1761169871/getstyled/ai-clothes-changer/ronaldo.jpg',
              'assets.garment_file_path':
                'https://res.cloudinary.com/dmueochke/image/upload/v1761169869/getstyled/ai-clothes-changer/pedro-t-shirt.jpg',
            };
          default:
            return {};
        }
      };

      const defaultImages = getDefaultImageUrls();

      // Only load if this tool hasn't had defaults loaded yet
      if (
        Object.keys(defaultImages).length > 0 &&
        !defaultImagesLoaded[tool.id]
      ) {
        // Load all default images in parallel
        const imagePromises = Object.entries(defaultImages)
          .filter(([key]) => !formData[key])
          .map(async ([key, url]) => {
            try {
              const file = await urlToFile(url, `default-${key}.jpg`);
              return { key, file };
            } catch {
              return null;
            }
          });

        const results = await Promise.all(imagePromises);
        const updates: Record<string, any> = {};

        results.forEach((result) => {
          if (result) {
            updates[result.key] = result.file;
          }
        });

        if (Object.keys(updates).length > 0) {
          setFormData((prev) => ({ ...prev, ...updates }));
          setDefaultImagesLoaded((prev) => ({ ...prev, [tool.id]: true }));
        }
      }
    };

    loadDefaultImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.id]);

  // Update form data when tool changes
  React.useEffect(() => {
    const newFlattenedParams = flattenParameters(tool.parameters);
    const newFormData: Record<string, any> = {};

    Object.entries(newFlattenedParams).forEach(([key, config]) => {
      if (config && typeof config === 'object' && 'default' in config) {
        newFormData[key] = config.default;
      } else {
        newFormData[key] = formData[key] || '';
      }
    });

    setFormData(newFormData);
    setDefaultImagesLoaded({}); // Reset default images loaded state on tool change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.id]); // Only reset when tool changes

  // Auto-scroll to generated image when a new image is generated
  React.useEffect(() => {
    if (generatedImage && generatedImageRef.current) {
      // Small delay to ensure the component is rendered
      setTimeout(() => {
        generatedImageRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [generatedImage]);

  const handleParameterChange = (key: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle quick prompt selection with multi-parameter updates
  const handlePromptSelect = async (prompt: Prompt) => {
    const updates: Record<string, any> = {};

    // Map prompt properties to form field keys based on tool type
    const getFieldMapping = (): Record<string, string> => {
      switch (tool.id) {
        case 'ai-image-generator':
          return {
            style: 'style.tool',
            orientation: 'orientation',
          };
        case 'ai-clothes-changer':
          return {
            personPhoto: 'assets.person_file_path',
            clothingItem: 'assets.garment_file_path',
            garmentType: 'assets.garment_type',
          };
        case 'face-swap-photo':
          return {
            sourceImage: 'assets.source_file_path',
            targetImage: 'assets.target_file_path',
          };
        case 'gemini-ai-image-editor':
          return {
            referenceImage: 'referenceImage',
          };
        case 'image-background-remover':
          return {
            referenceImage: 'assets.image_file_path',
            backgroundImage: 'assets.background_image_file_path',
          };
        case 'ai-headshot-generator':
          return {
            referenceImage: 'assets.image_file_path',
          };
        case 'ai-meme-generator':
          return {
            template: 'style.template',
          };
        default:
          return {};
      }
    };

    const fieldMapping = getFieldMapping();

    // Set non-image fields directly
    if (prompt.style && fieldMapping.style) {
      updates[fieldMapping.style] = prompt.style;
    }
    if (prompt.orientation && fieldMapping.orientation) {
      updates[fieldMapping.orientation] = prompt.orientation;
    }
    if (prompt.template && fieldMapping.template) {
      updates[fieldMapping.template] = prompt.template;
    }
    if (prompt.garmentType && fieldMapping.garmentType) {
      updates[fieldMapping.garmentType] = prompt.garmentType;
    }

    // Load image files from URLs in parallel
    const imageFields: Array<keyof Prompt> = [
      'sourceImage',
      'targetImage',
      'referenceImage',
      'personPhoto',
      'clothingItem',
      'backgroundImage',
    ];

    const imagePromises = imageFields
      .filter((field) => prompt[field] && fieldMapping[field])
      .map(async (field) => {
        const imageUrl = prompt[field];
        const targetField = fieldMapping[field];
        try {
          const file = await urlToFile(
            imageUrl as string,
            `preset-${field}.jpg`
          );
          return { targetField, file };
        } catch {
          return null;
        }
      });

    const imageResults = await Promise.all(imagePromises);
    imageResults.forEach((result) => {
      if (result) {
        updates[result.targetField] = result.file;
      }
    });

    // Apply all updates
    if (Object.keys(updates).length > 0) {
      setFormData((prev) => ({ ...prev, ...updates }));
    }
  };

  const handleExecute = async () => {
    // Check if user has enough credits
    if (!hasEnoughCredits(tool.credits)) {
      onShowLowCreditsModal();
      return;
    }

    // Validate required fields
    const errors: string[] = [];

    Object.entries(flattenedParams).forEach(([key, config]) => {
      if (config && typeof config === 'object' && config.required) {
        const value = formData[key];
        if (!value || (typeof value === 'string' && !value.trim())) {
          const label = key
            .split(/[_.-]/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          errors.push(`${label} is required`);
        }
      }
    });

    if (errors.length > 0) {
      showError(`Please fix the following errors:\n${errors.join('\n')}`);
      return;
    }

    // Convert flat structure back to nested and execute
    const parameters = unflattenParameters(formData);
    await onExecute(tool.id, parameters);
  };

  // Check if form is valid
  const isFormValid = React.useMemo(() => {
    return Object.entries(flattenedParams).every(([key, config]) => {
      if (config && typeof config === 'object' && config.required) {
        const value = formData[key];
        return value && (typeof value !== 'string' || value.trim());
      }
      return true;
    });
  }, [flattenedParams, formData]);

  return (
    <div className="h-full flex flex-col">
      {/* Tool Info */}
      <div className="flex flex-col gap-2 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
        <div className="relative w-full h-32 overflow-hidden rounded-md bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="absolute bottom-0 w-full flex items-center gap-2 bg-white/80 p-1 z-10">
            <div className="text-xs w-full text-end italic font-medium text-slate-600 wrap">
              {tool.description}.
            </div>
          </div>
          <ThumbnailRenderer
            key={tool.id}
            src={tool.thumbnail}
            alt={`${tool.name} thumbnail`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Parameters Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(flattenedParams).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              This tool has no configurable parameters.
            </p>
          </div>
        ) : (
          Object.entries(flattenedParams).map(([key, config]) => (
            <ParameterRenderer
              key={key}
              parameterKey={key}
              config={config as any}
              value={formData[key]}
              onChange={(value: unknown) => handleParameterChange(key, value)}
              disabled={isExecuting}
              toolId={tool.id}
              generatedImage={generatedImage}
              lastGeneratedImage={lastGeneratedImage}
              onPromptSelect={handlePromptSelect}
              isOnboardingActive={isOnboardingActive}
              onboardingStep={onboardingStep}
              onSetOnboardingTarget={onSetOnboardingTarget}
              onOnboardingNext={onOnboardingNext}
            />
          ))
        )}

        {/* Generated Image Display */}
        {(generatedImage || lastGeneratedImage) && (
          <div ref={generatedImageRef}>
            <GeneratedImageDisplay
              imageData={generatedImage || lastGeneratedImage!}
              isOnboardingActive={isOnboardingActive}
              onboardingStep={onboardingStep}
              onSetOnboardingTarget={onSetOnboardingTarget}
              onOnboardingNext={onOnboardingNext}
            />
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="py-2 px-4 bg-white border-t border-gray-200">
        <Button
          onClick={handleExecute}
          ref={generateButtonRef}
          disabled={isExecuting || !isFormValid}
          className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg"
        >
          {isExecuting ? (
            <div className="flex items-center text-white gap-2">
              <Spinner size="sm" />
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5" />
              <div className="flex items-center gap-0.5 ">
                <span>{tool.labelActionButton}</span>
                <span>({tool.credits} </span>
                <Coins className="h-4 w-4" />
                <span>)</span>
              </div>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ToolPage;
