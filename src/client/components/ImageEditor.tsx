import * as React from 'react';
import {
  Upload,
  Move,
  Circle,
  FileImage,
  Download,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import TutorialBanner from './TutorialBanner';
import { GenerationState } from '../hooks/useImageGeneration';
import { useImageEdition } from '../hooks/useImageEdition';
import { Button } from './ui/button';
import { serverFunctions } from '../utils/serverFunctions';
import { useToast } from '../hooks/useToast';

interface ImageEditorProps {
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

const ImageEditor: React.FC<ImageEditorProps> = ({
  selectedImage,
  setSelectedImage,
  generationState,
  lastGeneratedImage,
}) => {
  const [isInserting, setIsInserting] = React.useState(false);

  // Ref for the scrollable container
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Image edition hook
  const {
    settings,
    updateSettings,
    previewUrl,
    generatePreview,
    exportImage,
    initializeWithImage,
    resetSettings,
  } = useImageEdition();

  const { showSuccess, showError } = useToast();

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
        // Initialize settings with image dimensions
        initializeWithImage(file);
      } catch (error) {
        showError('Failed to load generated image');
      }
    }
  };

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

  // Generate preview when image or settings change
  React.useEffect(() => {
    if (selectedImage) {
      generatePreview(selectedImage);
    }
  }, [selectedImage, settings, generatePreview]);

  // Image upload handler
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file type is supported
      const supportedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];
      if (!supportedTypes.includes(file.type)) {
        showError('Please upload a JPG, PNG, or WebP image file.');
        return;
      }

      setSelectedImage(file);
      // Initialize settings with image dimensions
      initializeWithImage(file);
    }
  };

  const handleDownloadPreview = async () => {
    if (!selectedImage || !previewUrl) return;

    try {
      // Export image with correct format
      const blob = await exportImage(selectedImage);

      // Get file extension based on format
      const getFileExtension = (format: string) => {
        switch (format) {
          case 'jpg':
            return 'jpg';
          case 'webp':
            return 'webp';
          case 'png':
          default:
            return 'png';
        }
      };

      const extension = getFileExtension(settings.format);
      const url = URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `edited-image-${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(url);

      showSuccess('Image downloaded successfully!');
    } catch (error) {
      showError('Failed to download image');
    }
  };

  const handleInsertToDocument = async () => {
    if (!previewUrl) return;

    try {
      setIsInserting(true);
      await serverFunctions.insertImageToDoc(previewUrl);
      showSuccess('Image inserted into document!');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to insert image';
      showError(errorMessage);
    } finally {
      setIsInserting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {/* Tutorial Section */}
        <TutorialBanner />

        {/* Reference Image Section */}
        <div className="bg-white">
          <div className="px-4">
            <div>
              {selectedImage ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      Image to edit
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          resetSettings();
                        }}
                        className="text-xs text-gray-500 hover:text-red-500"
                        disabled={generationState.isGenerating}
                      >
                        Remove
                      </button>
                    </div>
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

                  <div className="flex items-center gap-3 px-2 bg-gray-50 rounded-lg italic">
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
                      accept="image/jpeg,image/jpg,image/png,image/webp"
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

        {/* Basic Tools Section */}
        <div className="flex flex-col gap-2 bg-white p-4">
          {/* Resize Tool */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Move className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-800">Resize</h3>
            </div>
            <div className="space-y-3 p-3 bg-white rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Width
                  </label>
                  <input
                    type="number"
                    value={settings.width}
                    onChange={(e) =>
                      updateSettings({
                        width: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Height
                  </label>
                  <input
                    type="number"
                    value={settings.height}
                    onChange={(e) =>
                      updateSettings({
                        height: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    min="1"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.maintainAspectRatio}
                  onChange={(e) =>
                    updateSettings({
                      maintainAspectRatio: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-700">
                  Maintain aspect ratio
                </span>
              </label>
            </div>
          </div>

          {/* Rounded Corners Tool */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Circle className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-medium text-gray-800">
                Rounded Corners
              </h3>
            </div>
            <div className="space-y-3 p-3 bg-white rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Border Radius: {settings.borderRadius}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={settings.borderRadius}
                  onChange={(e) =>
                    updateSettings({
                      borderRadius: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thin-thumb"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Square</span>
                  <span>Rounded</span>
                </div>
              </div>
            </div>
          </div>

          {/* Format Tool */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileImage className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-medium text-gray-800">Format</h3>
            </div>
            <div className="space-y-3 p-3 rounded-lg bg-white">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Output Format
                </label>
                <select
                  value={settings.format}
                  onChange={(e) =>
                    updateSettings({
                      format: e.target.value as 'png' | 'jpg' | 'webp',
                    })
                  }
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                >
                  <option value="png">PNG</option>
                  <option value="jpg">JPEG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={resetSettings}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
              disabled={generationState.isGenerating}
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>

        {/* Action Buttons Section - Only shown when there's a preview */}
        {previewUrl && (
          <div className="bg-white p-4 pt-0">
            {/* Action Buttons */}
            <div className="flex gap-2 mb-3">
              <Button
                onClick={handleInsertToDocument}
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
                onClick={handleDownloadPreview}
                className="px-4 hover:bg-gray-50 border-gray-300"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>

            {/* Tips */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Pro tip:</p>
                  <p>
                    Click "Insert to Document" to add the edited image directly
                    to your current document, or download it for later use.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageEditor;
