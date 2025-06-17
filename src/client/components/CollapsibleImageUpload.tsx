import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import ImageUpload from './ImageUpload';

interface CollapsibleImageUploadProps {
  onImageSelect: (file: File | null) => void;
  selectedImage: File | null;
  className?: string;
}

const CollapsibleImageUpload: React.FC<CollapsibleImageUploadProps> = ({
  onImageSelect,
  selectedImage,
  className,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    if (selectedImage && !isExpanded) {
      setIsExpanded(true);
    }
  }, [selectedImage, isExpanded]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (isExpanded && selectedImage) {
      onImageSelect(null);
    }
  };

  return (
    <div className={className}>
      <Button
        variant="outline"
        onClick={toggleExpanded}
        className="w-full justify-between text-sm"
      >
        <div className="flex items-center">Add Reference Image (Optional)</div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <ImageUpload
          selectedImage={selectedImage}
          onImageSelect={onImageSelect}
        />
      </div>
    </div>
  );
};

export default CollapsibleImageUpload;
