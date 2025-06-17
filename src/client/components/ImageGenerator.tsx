import * as React from 'react';
import {
  Sparkles,
  Upload,
  Sliders,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit3,
  Zap,
} from 'lucide-react';
import { Button } from './ui/button';
import Textarea from './ui/textarea';
import Spinner from './ui/spinner';
import GeneratedImageDisplay from './GeneratedImageDisplay';
import { useImageGeneration } from '../hooks/useImageGeneration';

const createPrompts = [
  {
    id: 'portrait',
    label: 'Portrait Photo',
    prompt:
      'Create a professional portrait photo of a person with natural lighting, sharp focus, and a clean background. High quality, photorealistic style.',
  },
  {
    id: 'landscape',
    label: 'Landscape Scene',
    prompt:
      'Create a breathtaking landscape scene with mountains, rivers, and dramatic sky. Use vibrant colors and cinematic composition.',
  },
  {
    id: '3d-render',
    label: '3D Render',
    prompt:
      'Create a modern 3D rendered object with clean geometry, professional lighting, and realistic materials. Studio lighting setup.',
  },
  {
    id: 'illustration',
    label: 'Digital Art',
    prompt:
      'Create a digital illustration with vibrant colors, artistic style, and creative composition. Modern digital art aesthetic.',
  },
];

const editPrompts = [
  {
    id: 'add-text-pill',
    label: 'Add Text Badge',
    prompt:
      'Add a modern text pill or badge overlay to this image. The text should be contained in a rounded rectangle with a clean design, positioned prominently.',
  },
  {
    id: 'add-logo',
    label: 'Add Logo',
    prompt:
      'Add a professional company logo to this image. The logo should be tastefully integrated into the composition with proper sizing and placement.',
  },
  {
    id: 'change-background',
    label: 'Change Background',
    prompt:
      'Replace the background of this image with a new, more suitable background while keeping the main subject intact.',
  },
  {
    id: 'enhance-colors',
    label: 'Enhance Colors',
    prompt:
      'Enhance and improve the colors in this image. Make them more vibrant, balanced, and visually appealing while maintaining realism.',
  },
];

const ImageGenerator: React.FC = () => {
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [prompt, setPrompt] = React.useState('');
  const [transparentBackground, setTransparentBackground] =
    React.useState(false);
  const [temperature, setTemperature] = React.useState(0.7);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [showCreate, setShowCreate] = React.useState(true);
  const [showEdit, setShowEdit] = React.useState(false);
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        {/* Quick Start Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-medium text-gray-800">Quick Start</h2>
          </div>

          {/* Create Subsection */}
          <div className="mb-3">
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-800">
                  Create
                </span>
              </div>
              {showCreate ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {showCreate && (
              <div className="space-y-2 mt-2">
                {createPrompts.map((quickPrompt) => (
                  <button
                    key={quickPrompt.id}
                    onClick={() => handlePromptSelect(quickPrompt.prompt)}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-200 rounded-lg transition-all duration-200 text-left group h-12"
                    disabled={generationState.isGenerating}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Plus className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                      {quickPrompt.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Edit Subsection */}
          <div>
            <button
              onClick={() => setShowEdit(!showEdit)}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-800">Edit</span>
                <span className="text-xs text-gray-500">
                  (requires reference image)
                </span>
              </div>
              {showEdit ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {showEdit && (
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
                    <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                      {quickPrompt.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Prompt Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mt-4">
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
            className="resize-y min-h-[80px] max-h-[200px] border-gray-200 focus:border-blue-400 focus:ring-blue-400"
            disabled={generationState.isGenerating}
          />
        </div>

        {/* Reference Image Section */}
        {selectedImage ? (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h2 className="text-sm font-medium text-gray-800">
                  Reference Image
                </h2>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-xs text-gray-500 hover:text-red-500"
              >
                Remove
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Upload className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 truncate">
                {selectedImage.name}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h2 className="text-sm font-medium text-gray-800">
                Reference Image
              </h2>
              <span className="text-xs text-gray-500">(Optional)</span>
            </div>
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Upload reference image
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={generationState.isGenerating}
              />
            </label>
          </div>
        )}

        {/* Advanced Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-800">
                Advanced Settings
              </span>
            </div>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {showAdvanced && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={generationState.isGenerating}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Conservative</span>
                  <span>Creative</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generated Image Display */}
        {generationState.generatedImage && (
          <div className="mt-4">
            <GeneratedImageDisplay imageData={generationState.generatedImage} />
          </div>
        )}
      </div>

      {/* Generate Button - Fixed at Bottom */}
      <div className="p-4 bg-white border-t border-gray-200">
        <Button
          onClick={handleGenerate}
          disabled={generationState.isGenerating || !prompt.trim()}
          className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
        >
          {generationState.isGenerating ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span>Creating magic...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5" />
              <span>Generate Image</span>
            </div>
          )}
        </Button>

        {generationState.isGenerating && generationState.eta && (
          <div className="text-center mt-2">
            <p className="text-sm text-gray-500">
              ⏱️ About {generationState.eta} seconds remaining
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
