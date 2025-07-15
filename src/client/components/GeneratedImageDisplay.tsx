import * as React from 'react';
import { Download, FileImage, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { serverFunctions } from '../utils/serverFunctions';
import { useToast } from '../hooks/useToast';
import { resizeImageForSheets } from '../utils/imageResizer';

interface GeneratedImageDisplayProps {
  imageData: string;
  className?: string;
}

const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({
  imageData,
  className,
}) => {
  const { showSuccess, showError } = useToast();
  const [isInserting, setIsInserting] = React.useState(false);

  const handleDownload = () => {
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `ai-generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess('Image downloaded successfully!');
    } catch (error) {
      showError('Failed to download image');
    }
  };

  const handleInsertToDocument = async () => {
    try {
      setIsInserting(true);

      // Resize image for Google Sheets compatibility
      const resizedImageData = await resizeImageForSheets(imageData);

      await serverFunctions.insertImageToTarget(resizedImageData);
      showSuccess('Image inserted successfully!');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to insert image';
      showError(errorMessage);
    } finally {
      setIsInserting(false);
    }
  };

  return (
    <div className={`bg-white overflow-hidden ${className}`}>
      {/* Image Display */}
      <div className="p-4">
        <div className="relative group">
          <img
            src={imageData}
            alt="AI Generated"
            className="w-full rounded-lg shadow-md border border-gray-200 transition-transform group-hover:scale-[1.02]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
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
            onClick={handleDownload}
            className="px-4 hover:bg-gray-50 border-gray-300"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* Tips */}
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">Pro tip:</p>
              <p>
                Use the Edit tab to resize, change the format, or tweak other
                aspects of your image. Bonus: You can use the Edit tab with any
                image!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedImageDisplay;
