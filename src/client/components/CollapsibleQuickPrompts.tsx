import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = React.useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={className}>
      <Button
        variant="outline"
        onClick={toggleExpanded}
        className="w-full justify-between text-sm"
        disabled={disabled}
      >
        <div className="flex items-center">Quick Prompts (Optional)</div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
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
