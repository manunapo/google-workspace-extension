import * as React from 'react';
import { Upload } from 'lucide-react';

interface FileParameterProps {
  label: string;
  value: File | string;
  onChange: (value: File | string) => void;
  required?: boolean;
  disabled?: boolean;
  accept?: string;
  placeholder?: string;
  generatedImage?: string | null;
  lastGeneratedImage?: string | null;
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

const FileParameter: React.FC<FileParameterProps> = ({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  accept = 'image/*',
  placeholder = 'Upload image',
  generatedImage,
  lastGeneratedImage,
}) => {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  // Generate preview URL when file changes
  React.useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);

      // Cleanup previous URL
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    setPreviewUrl(null);
    return undefined;
  }, [value]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const handleAddGeneratedImage = () => {
    const availableImage = generatedImage || lastGeneratedImage;
    if (availableImage) {
      try {
        const timestamp = Date.now();
        const file = base64ToFile(
          availableImage,
          `generated-image-${timestamp}.png`
        );
        onChange(file);
      } catch (error) {
        console.error('Failed to load generated image:', error);
      }
    }
  };

  return (
    <div className="bg-white">
      <div>
        {value instanceof File ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="text-sm font-medium text-gray-700">
                  {label}
                  {required && <span className="text-red-500 ml-0.5">*</span>}
                </h3>
              </div>
              <button
                onClick={() => onChange('')}
                className="text-xs text-gray-500 hover:text-red-500"
                disabled={disabled}
                type="button"
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
                {value.name}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h3 className="text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
              </h3>
            </div>

            <label
              className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg transition-colors ${
                disabled
                  ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
              }`}
            >
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">{placeholder}</span>
              <input
                type="file"
                accept={accept}
                onChange={handleImageUpload}
                className="hidden"
                disabled={disabled}
              />
            </label>

            {(generatedImage || lastGeneratedImage) && (
              <div className="flex justify-center">
                <button
                  onClick={handleAddGeneratedImage}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  disabled={disabled}
                  type="button"
                >
                  Add generated image
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileParameter;
