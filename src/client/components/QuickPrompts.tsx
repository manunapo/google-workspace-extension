import * as React from 'react';
import { Button } from './ui/button';

interface QuickPromptsProps {
  onPromptSelect: (prompt: string) => void;
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

const QuickPrompts: React.FC<QuickPromptsProps> = ({ onPromptSelect }) => {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700">
        Start with a quick prompt
      </div>
      <div className="grid grid-cols-2 gap-2">
        {quickPrompts.map((prompt) => (
          <Button
            key={prompt.id}
            variant="outline"
            size="sm"
            onClick={() => onPromptSelect(prompt.prompt)}
            className="text-xs h-auto py-2 px-3 whitespace-normal text-left"
          >
            {prompt.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickPrompts;
