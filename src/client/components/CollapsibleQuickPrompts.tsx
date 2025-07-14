import * as React from 'react';
import { Button } from './ui/button';

interface CollapsibleQuickPromptsProps {
  onPromptSelect: (prompt: string) => void;
  disabled?: boolean;
  className?: string;
}

const quickPrompts = [
  {
    id: '3d-pixar',
    label: '3D Pixar',
    prompt:
      'Create a 3D Pixar-style animated character with vibrant colors, smooth textures, and expressive features. The character should have a friendly, approachable design with exaggerated proportions typical of Pixar animation.',
  },
  {
    id: 'simpsons',
    label: 'Simpsons Style',
    prompt:
      'Create an image in The Simpsons cartoon style with yellow skin, simple line art, bold outlines, and the characteristic animation style of the TV show. Use bright, saturated colors.',
  },
  {
    id: 'add-logo',
    label: 'Add Logo',
    prompt:
      'Add a professional company logo to this image. The logo should be tastefully integrated into the composition, with proper sizing and placement that enhances rather than detracts from the overall design.',
  },
  {
    id: 'add-pill-text',
    label: 'Add Text Pill',
    prompt:
      'Add a modern text pill or badge overlay to this image. The text should be contained in a rounded rectangle with a subtle background, positioned prominently but not overwhelming the main subject.',
  },
];

const CollapsibleQuickPrompts: React.FC<CollapsibleQuickPromptsProps> = ({
  onPromptSelect,
  disabled = false,
  className,
}) => {
  return (
    <div className={className}>
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-800 mb-3">
          Quick Prompts (Optional)
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {quickPrompts.map((prompt) => (
            <Button
              key={prompt.id}
              variant="outline"
              size="sm"
              onClick={() => onPromptSelect(prompt.prompt)}
              className="text-xs h-auto py-2 px-3 whitespace-normal text-left"
              disabled={disabled}
            >
              {prompt.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleQuickPrompts;
