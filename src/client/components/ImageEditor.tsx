import * as React from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Upload,
  ChevronDown,
  ChevronUp,
  Edit3,
  Move,
  Circle,
  FileImage,
  Download,
  RotateCcw,
  Crop as CropIcon,
  Check,
} from 'lucide-react';
import TutorialBanner from './TutorialBanner';
import { GenerationState } from '../hooks/useImageGeneration';
import { useImageEdition } from '../hooks/useImageEdition';

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

type ActiveTool = 'crop' | 'resize' | 'rounded' | 'format' | null;

const ImageEditor: React.FC<ImageEditorProps> = ({
  selectedImage,
  setSelectedImage,
  generationState,
}) => {
  const [activeTool, setActiveTool] = React.useState<ActiveTool>(null);

  // Crop state
  const [crop, setCrop] = React.useState<Crop>();
  const [completedCrop, setCompletedCrop] = React.useState<PixelCrop>();
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Ref for the scrollable container
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Image edition hook
  const {
    settings,
    updateSettings,
    cropSettings,
    setCropSettings,
    previewUrl,
    generatePreview,
    exportImage,
    resetSettings,
  } = useImageEdition();

  // Image load handler for crop
  const onImageLoad = React.useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight } = e.currentTarget;
      updateSettings({
        width: naturalWidth,
        height: naturalHeight,
      });
    },
    [updateSettings]
  );

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
  }, [selectedImage, settings, cropSettings, generatePreview]);

  // Initialize image dimensions when a new image is uploaded
  React.useEffect(() => {
    if (selectedImage) {
      const img = new Image();
      img.onload = () => {
        updateSettings({
          width: img.width,
          height: img.height,
        });
      };
      img.src = URL.createObjectURL(selectedImage);
    }
  }, [selectedImage, updateSettings]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      resetSettings();
    }
  };

  const handleExportImage = async () => {
    if (!selectedImage) return;

    try {
      const blob = await exportImage(selectedImage);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited-image.${settings.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting image:', error);
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
                        resetSettings();
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

                  <div className="flex items-center gap-3 px-2 bg-gray-50 rounded-lg italic">
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

        {/* Basic Tools Section */}
        {selectedImage && (
          <div className="bg-white rounded-xl p-4 pb-0 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-medium text-gray-800">
                  Basic Tools
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetSettings}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                  disabled={generationState.isGenerating}
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
                <button
                  onClick={handleExportImage}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded"
                  disabled={generationState.isGenerating || !selectedImage}
                >
                  <Download className="w-3 h-3" />
                  Export
                </button>
              </div>
            </div>

            {/* Crop Tool */}
            <div className="mb-3">
              <button
                onClick={() =>
                  setActiveTool(activeTool === 'crop' ? null : 'crop')
                }
                className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                disabled={generationState.isGenerating}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <CropIcon className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-medium text-gray-800">
                      Crop
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {activeTool === 'crop' && (
                    <Check className="w-3 h-3 text-green-500" />
                  )}
                  {activeTool === 'crop' ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </button>

              {activeTool === 'crop' && (
                <div className="space-y-3 mt-2 p-3 bg-gray-50 rounded-lg">
                  {selectedImage && (
                    <div className="space-y-2">
                      <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={undefined}
                        minWidth={10}
                        minHeight={10}
                      >
                        <img
                          ref={imgRef}
                          alt="Crop preview"
                          src={URL.createObjectURL(selectedImage)}
                          style={{
                            maxHeight: '200px',
                            width: '100%',
                            objectFit: 'contain',
                          }}
                          onLoad={onImageLoad}
                        />
                      </ReactCrop>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setCrop(undefined);
                            setCompletedCrop(undefined);
                            setCropSettings(null);
                          }}
                          className="px-3 py-2 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded"
                        >
                          Clear Crop
                        </button>
                        <button
                          onClick={() => {
                            if (completedCrop && imgRef.current) {
                              setCropSettings({
                                x: completedCrop.x,
                                y: completedCrop.y,
                                width: completedCrop.width,
                                height: completedCrop.height,
                              });
                            }
                          }}
                          className="px-3 py-2 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded"
                          disabled={!completedCrop}
                        >
                          Apply Crop
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Resize Tool */}
            <div className="mb-3">
              <button
                onClick={() =>
                  setActiveTool(activeTool === 'resize' ? null : 'resize')
                }
                className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                disabled={generationState.isGenerating}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Move className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-gray-800">
                      Resize
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {activeTool === 'resize' && (
                    <Check className="w-3 h-3 text-blue-500" />
                  )}
                  {activeTool === 'resize' ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </button>

              {activeTool === 'resize' && (
                <div className="space-y-3 mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={settings.width}
                        onChange={(e) =>
                          updateSettings({
                            width: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                        min="1"
                        max="4096"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={settings.height}
                        onChange={(e) =>
                          updateSettings({
                            height: parseInt(e.target.value, 10) || 0,
                          })
                        }
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                        min="1"
                        max="4096"
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
              )}
            </div>

            {/* Rounded Corners Tool */}
            <div className="mb-3">
              <button
                onClick={() =>
                  setActiveTool(activeTool === 'rounded' ? null : 'rounded')
                }
                className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                disabled={generationState.isGenerating}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-medium text-gray-800">
                      Rounded Corners
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {activeTool === 'rounded' && (
                    <Check className="w-3 h-3 text-purple-500" />
                  )}
                  {activeTool === 'rounded' ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </button>

              {activeTool === 'rounded' && (
                <div className="space-y-3 mt-2 p-3 bg-gray-50 rounded-lg">
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
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Square</span>
                      <span>Rounded</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Format Tool */}
            <div className="mb-3">
              <button
                onClick={() =>
                  setActiveTool(activeTool === 'format' ? null : 'format')
                }
                className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                disabled={generationState.isGenerating}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-medium text-gray-800">
                      Format
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {activeTool === 'format' && (
                    <Check className="w-3 h-3 text-indigo-500" />
                  )}
                  {activeTool === 'format' ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </button>

              {activeTool === 'format' && (
                <div className="space-y-3 mt-2 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Export Format
                    </label>
                    <div className="flex gap-2">
                      {(['png', 'jpg', 'webp'] as const).map((format) => (
                        <label
                          key={format}
                          className="flex items-center gap-1 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="format"
                            value={format}
                            checked={settings.format === format}
                            onChange={(e) =>
                              updateSettings({
                                format: e.target.value as
                                  | 'png'
                                  | 'jpg'
                                  | 'webp',
                              })
                            }
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700 uppercase">
                            {format}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {settings.format !== 'png' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quality: {Math.round(settings.quality * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={settings.quality}
                        onChange={(e) =>
                          updateSettings({
                            quality: parseFloat(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageEditor;
