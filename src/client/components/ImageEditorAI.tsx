import * as React from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import { Upload, Edit3, Sparkles } from 'lucide-react';
import Textarea from './ui/textarea';
import GeneratedImageDisplay from './GeneratedImageDisplay';
import TutorialBanner from './TutorialBanner';
import { GenerationState } from '../hooks/useImageGeneration';
import { editPrompts } from '../../config';

interface ImageEditorAIProps {
  selectedImage: File | null;
  setSelectedImage: React.Dispatch<React.SetStateAction<File | null>>;
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  transparentBackground: boolean;
  setTransparentBackground: React.Dispatch<React.SetStateAction<boolean>>;
  temperature: number;
  setTemperature: React.Dispatch<React.SetStateAction<number>>;
  generationState: GenerationState;
  lastGeneratedImage: string | null;
}

const ImageEditorAI: React.FC<ImageEditorAIProps> = ({
  selectedImage,
  setSelectedImage,
  prompt,
  setPrompt,
  transparentBackground,
  setTransparentBackground,
  temperature,
  setTemperature,
  generationState,
  lastGeneratedImage,
}) => {
  // Ref for the scrollable container
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

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
    <div className="flex flex-col h-full bg-gray-50">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-1">
        {/* Tutorial Section */}
        <TutorialBanner />

        {/* Reference Image Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 border-t border-gray-100">
            <div>
              {selectedImage ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      Current Image
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

                  <div className="flex items-center px-2 gap-3 bg-gray-50 rounded-lg italic">
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 truncate">
                      {selectedImage.name}
                    </span>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </div>

        {/* Edit with AI Section */}
        <div className="bg-white rounded-xl p-4 pb-0 shadow-sm border border-gray-100">
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
        <div className="bg-white rounded-xl p-4 pb-0 shadow-sm border border-gray-100">
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
            <div className="pt-3">
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
            </div>

            <div>
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
