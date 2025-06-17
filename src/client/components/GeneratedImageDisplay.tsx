import * as React from 'react';
import { Download, FileImage } from 'lucide-react';
import { Button } from './ui/button';
import { serverFunctions } from '../utils/serverFunctions';
import { useToast } from '../hooks/useToast';

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
      link.download = `generated-image-${Date.now()}.png`;
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
      await serverFunctions.insertImageToDoc(imageData);
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
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Generated Image</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleInsertToDocument}
            disabled={isInserting}
            className="text-xs"
          >
            <FileImage className="w-3 h-3 mr-1" />
            {isInserting ? 'Inserting...' : 'Insert'}
          </Button>
        </div>
      </div>
      <img
        src={imageData}
        alt="Generated"
        className="w-full rounded-md border"
      />
    </div>
  );
};

export default GeneratedImageDisplay;
