/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import { Upload, Edit3, Sparkles } from 'lucide-react';
import Textarea from './ui/textarea';
import GeneratedImageDisplay from './GeneratedImageDisplay';
import TutorialBanner from './TutorialBanner';
import { GenerationState } from '../hooks/useImageGeneration';
import { editPrompts } from '../../config';
import { useToast } from '../hooks/useToast';

interface ImageEditorAIProps {
  selectedImage: File | null;
  setSelectedImage: React.Dispatch<React.SetStateAction<File | null>>;
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  temperature: number;
  setTemperature: React.Dispatch<React.SetStateAction<number>>;
  generationState: GenerationState;
  lastGeneratedImage: string | null;
  transparentBackground?: boolean;
  setTransparentBackground?: React.Dispatch<React.SetStateAction<boolean>>;
}

// Utility function to convert base64 to File
const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n > 0) {
    n -= 1;
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const ImageEditorAI: React.FC<ImageEditorAIProps> = ({
  selectedImage,
  setSelectedImage,
  prompt,
  setPrompt,
  temperature,
  setTemperature,
  generationState,
  lastGeneratedImage,
}) => {
  // Ref for the scrollable container
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Create preview URL for uploaded image
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const { showError } = useToast();

  // Handle adding generated image to editor
  const handleAddGeneratedImage = () => {
    const availableImage = generationState.generatedImage || lastGeneratedImage;

    if (availableImage) {
      try {
        // Convert base64 to File object
        const timestamp = Date.now();
        const file = base64ToFile(
          availableImage,
          `generated-image-${timestamp}.png`
        );
        setSelectedImage(file);
      } catch (error) {
        showError('Failed to load generated image');
      }
    }
  };

  // Generate preview URL when image changes
  React.useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setPreviewUrl(url);

      // Cleanup previous URL
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    setPreviewUrl(null);
    return undefined;
  }, [selectedImage]);

  // Auto-scroll to bottom when image is generated
  React.useEffect(() => {
    if (generationState.generatedImage && scrollContainerRef.current) {
      // Small delay to ensure the image is rendered
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 100);
    }
  }, [generationState.generatedImage]);

  const handlePromptSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {/* Tutorial Section */}
        <TutorialBanner />

        {/* Reference Image Section */}
        <div className="bg-white ">
          <div className="px-4">
            <div>
              {selectedImage ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      Image to edit
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                      }}
                      className="text-xs text-gray-500 hover:text-red-500"
                      disabled={generationState.isGenerating}
                    >
                      Remove
                    </button>
                  </div>

                  {/* Show preview if available */}
                  {previewUrl && (
                    <div className="mb-3">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-auto rounded-lg border border-gray-200"
                        style={{
                          maxHeight: '200px',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                  )}

                  <div className="flex items-center px-2 gap-3 bg-gray-50 rounded-lg italic">
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 truncate">
                      {selectedImage.name}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label
                    className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg transition-colors ${
                      generationState.isGenerating
                        ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                    }`}
                  >
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Upload image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={generationState.isGenerating}
                    />
                  </label>

                  {(generationState.generatedImage || lastGeneratedImage) && (
                    <div className="flex justify-center">
                      <button
                        onClick={handleAddGeneratedImage}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        disabled={generationState.isGenerating}
                      >
                        Add generated image
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit with AI Section */}
        <div className="bg-white p-4 pb-0">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-medium text-gray-800">Quick Start</h2>
          </div>

          <div>
            <div className="space-y-2 mt-2">
              {editPrompts.map((quickPrompt) => (
                <button
                  key={quickPrompt.id}
                  onClick={() => handlePromptSelect(quickPrompt.prompt)}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 border border-gray-200 rounded-lg transition-all duration-200 text-left group h-12"
                  disabled={generationState.isGenerating}
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
        </div>

        {/* Main Prompt Section */}
        <div className="bg-white p-4 pb-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h2 className="text-sm font-medium text-gray-800">
              Describe Your Vision
            </h2>
          </div>
          <Textarea
            placeholder="What would you like to create? Be as detailed as possible..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="resize-y min-h-[120px] max-h-[200px] border-gray-200 focus:border-blue-400 focus:ring-blue-400"
            disabled={generationState.isGenerating}
          />
        </div>

        {/* Advanced Settings */}
        <div className="bg-white px-4 pb-4">
          <div className="px-4 space-y-3">
            {/* <div className="pt-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={transparentBackground}
                  onChange={(e) => setTransparentBackground(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={generationState.isGenerating}
                />
                <span className="text-xs text-gray-700">
                  Transparent background
                </span>
              </label>
            </div> */}

            <div className="pt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Creativity: {Math.round(temperature * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thin-thumb"
                disabled={generationState.isGenerating}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Conservative</span>
                <span>Creative</span>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Image Display */}
        {(generationState.generatedImage || lastGeneratedImage) && (
          <GeneratedImageDisplay
            imageData={generationState.generatedImage || lastGeneratedImage!}
          />
        )}
      </div>
    </div>
  );
};

export default ImageEditorAI;
