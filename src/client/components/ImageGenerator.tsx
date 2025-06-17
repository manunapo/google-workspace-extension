import * as React from 'react';
import { Button } from './ui/button';
import Textarea from './ui/textarea';
import Spinner from './ui/spinner';
import CollapsibleImageUpload from './CollapsibleImageUpload';
import CollapsibleSettings from './CollapsibleSettings';
import GeneratedImageDisplay from './GeneratedImageDisplay';
import { useImageGeneration } from '../hooks/useImageGeneration';
import QuickPrompts from './QuickPrompts';

const ImageGenerator: React.FC = () => {
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [prompt, setPrompt] = React.useState('');
  const [transparentBackground, setTransparentBackground] =
    React.useState(false);
  const [temperature, setTemperature] = React.useState(0.7);
  const { generationState, generateImage } = useImageGeneration();

  const handlePromptSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
  };

  const handleGenerate = async () => {
    let imageData = null;
    if (selectedImage) {
      const reader = new FileReader();
      imageData = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target?.result);
        reader.readAsDataURL(selectedImage);
      });
    }

    await generateImage(
      prompt,
      imageData as string | null,
      transparentBackground,
      temperature
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex-1 flex flex-col space-y-4">
        <QuickPrompts onPromptSelect={handlePromptSelect} />

        {/* Prompt Text Area - Always Visible */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">
            Or describe what you want to create
          </div>
          <Textarea
            placeholder="Enter your image description here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="resize-none min-h-[120px]"
            disabled={generationState.isGenerating}
          />
        </div>

        {/* Collapsible Sections - All Collapsed by Default */}
        <div className="space-y-3">
          <CollapsibleImageUpload
            selectedImage={selectedImage}
            onImageSelect={setSelectedImage}
          />

          <CollapsibleSettings
            transparentBackground={transparentBackground}
            temperature={temperature}
            onTransparentBackgroundChange={setTransparentBackground}
            onTemperatureChange={setTemperature}
            disabled={generationState.isGenerating}
          />
        </div>

        {/* Generated Image Display - Between Settings and Generate Button */}
        {generationState.generatedImage && (
          <GeneratedImageDisplay imageData={generationState.generatedImage} />
        )}

        {/* Generate Button - Always at Bottom */}
        <div className="space-y-3 mt-auto">
          <Button
            onClick={handleGenerate}
            disabled={generationState.isGenerating || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {generationState.isGenerating ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                Generating...
              </div>
            ) : (
              'Generate Image'
            )}
          </Button>

          {generationState.isGenerating && generationState.eta && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Estimated time: {generationState.eta} seconds
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
