/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { Coins, Sparkles } from 'lucide-react';
import { Tool } from '../../config';
import ParameterRenderer from './ParameterRenderer';
import { Button } from './ui/button';
import Spinner from './ui/spinner';
import GeneratedImageDisplay from './GeneratedImageDisplay';
import { useUserCredits } from '../hooks/useUserCredits';
import { useToast } from '../hooks/useToast';

interface ToolPageProps {
  tool: Tool;
  onExecute: (toolId: string, parameters: Record<string, any>) => Promise<void>;
  isExecuting: boolean;
  generatedImage?: string | null;
  lastGeneratedImage?: string | null;
}

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

const ToolPage: React.FC<ToolPageProps> = ({
  tool,
  onExecute,
  isExecuting,
  generatedImage,
  lastGeneratedImage,
}) => {
  const { hasEnoughCredits, getCreditsDisplay } = useUserCredits();
  const { showError } = useToast();

  // Flatten the tool parameters for easier management
  const flattenedParams = React.useMemo(
    () => flattenParameters(tool.parameters),
    [tool.parameters]
  );

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
  }, [tool.id]); // Only reset when tool changes

  const handleParameterChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleExecute = async () => {
    // Check if user has enough credits
    if (!hasEnoughCredits(tool.credits)) {
      showError(
        `Insufficient credits. This tool requires ${
          tool.credits
        } credits, but you only have ${getCreditsDisplay()}.`
      );
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
          <div className="absolute bottom-0 left-0 w-full flex items-center gap-2 bg-white/80 p-1">
            <div className="text-xs w-full italic font-medium text-slate-600 wrap">
              {tool.description}.
            </div>
          </div>
          <img
            src={tool.thumbnail}
            alt={`${tool.name} thumbnail`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to gradient background if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.parentElement?.querySelector(
                '.fallback-bg'
              ) as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
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
              onChange={(value) => handleParameterChange(key, value)}
              disabled={isExecuting}
              toolId={tool.id}
              generatedImage={generatedImage}
              lastGeneratedImage={lastGeneratedImage}
            />
          ))
        )}
      </div>

      {/* Action Button */}
      <div className="py-2 px-4 bg-white border-t border-gray-200">
        <Button
          onClick={handleExecute}
          disabled={
            isExecuting || !isFormValid || !hasEnoughCredits(tool.credits)
          }
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

        {!hasEnoughCredits(tool.credits) && (
          <p className="text-xs text-red-600 mt-2 text-center">
            Insufficient credits. You have {getCreditsDisplay()}, but need{' '}
            {tool.credits}.
          </p>
        )}

        {/* Generated Image Display */}
        {(generatedImage || lastGeneratedImage) && (
          <GeneratedImageDisplay
            imageData={generatedImage || lastGeneratedImage!}
          />
        )}
      </div>
    </div>
  );
};

export default ToolPage;
