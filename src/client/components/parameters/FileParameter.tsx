import * as React from 'react';
import { Upload, X, Image } from 'lucide-react';

interface FileParameterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  accept?: string;
  placeholder?: string;
}

const FileParameter: React.FC<FileParameterProps> = ({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  accept = 'image/*',
  placeholder = 'Choose file or enter URL',
}) => {
  const inputId = React.useId();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const handleFileSelect = React.useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          onChange(result);
        }
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const { files } = e.dataTransfer;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const clearFile = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* URL Input */}
      <input
        type="text"
        value={
          typeof value === 'string' && value.startsWith('http') ? value : ''
        }
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
      />

      <div className="text-center text-xs text-gray-500">or</div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
          // eslint-disable-next-line no-nested-ternary
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : value && !value.startsWith('http')
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {value && !value.startsWith('http') ? (
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Image className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-800">File selected</p>
            <button
              type="button"
              onClick={clearFile}
              className="mt-2 text-xs text-red-600 hover:text-red-800 flex items-center justify-center gap-1 mx-auto"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">
              Drop file here or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">Supports {accept}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileParameter;
