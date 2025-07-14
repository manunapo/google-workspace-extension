import * as React from 'react';
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
  return (
    <div className={className}>
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-800 mb-3">
          Add Reference Image (Optional)
        </h3>
        <ImageUpload
          selectedImage={selectedImage}
          onImageSelect={onImageSelect}
        />
      </div>
    </div>
  );
};

export default CollapsibleImageUpload;
