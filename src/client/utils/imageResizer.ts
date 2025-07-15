/**
 * Utility functions for resizing images to fit within Google Sheets constraints
 */

// Google Sheets limits: 2MB file size, 1 million pixels max
const MAX_PIXELS = 800000; // Using 800k instead of 1M for safety margin
const MAX_FILE_SIZE = 1.5 * 1024 * 1024; // 1.5MB instead of 2MB for safety margin

/**
 * Calculates the approximate size of a base64 string in bytes
 * @param base64String - Base64 encoded string
 * @returns number - Size in bytes
 */
const getBase64Size = (base64String: string): number => {
  const base64Data = base64String.split(',')[1] || base64String;
  return Math.ceil(base64Data.length * 0.75); // Base64 is ~75% efficient
};

/**
 * Checks if an image has transparency by examining its data URL
 * @param imageData - Base64 data URL of the image
 * @returns boolean - True if image likely has transparency
 */
const hasTransparency = (imageData: string): boolean => {
  // Check if it's a PNG (most common transparent format)
  if (imageData.startsWith('data:image/png')) {
    return true;
  }

  // Check if it's a WebP that might have transparency
  if (imageData.startsWith('data:image/webp')) {
    return true;
  }

  return false;
};

/**
 * Resizes an image to fit within Google Sheets constraints
 * @param imageData - Base64 data URL of the image
 * @returns Promise<string> - Resized image as base64 data URL
 */
export const resizeImageForSheets = (imageData: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas and image elements
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        reject(new Error('Cannot create canvas context'));
        return;
      }

      img.onload = () => {
        try {
          let { width, height } = img;
          const totalPixels = width * height;
          const preserveTransparency = hasTransparency(imageData);

          // Calculate new dimensions if image is too large
          if (totalPixels > MAX_PIXELS) {
            const ratio = Math.sqrt(MAX_PIXELS / totalPixels);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          // Set canvas size
          canvas.width = width;
          canvas.height = height;

          // Clear canvas with transparent background if preserving transparency
          if (preserveTransparency) {
            ctx.clearRect(0, 0, width, height);
          }

          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);

          let resizedImageData: string;

          if (preserveTransparency) {
            // For images with transparency, use PNG format
            resizedImageData = canvas.toDataURL('image/png');

            // If PNG is still too large, try reducing dimensions
            if (getBase64Size(resizedImageData) > MAX_FILE_SIZE) {
              const reductionFactor = Math.sqrt(
                MAX_FILE_SIZE / getBase64Size(resizedImageData)
              );
              const newWidth = Math.floor(width * reductionFactor);
              const newHeight = Math.floor(height * reductionFactor);

              canvas.width = newWidth;
              canvas.height = newHeight;
              ctx.clearRect(0, 0, newWidth, newHeight);
              ctx.drawImage(img, 0, 0, newWidth, newHeight);
              resizedImageData = canvas.toDataURL('image/png');
            }
          } else {
            // For images without transparency, use JPEG with quality adjustment
            let quality = 0.9;
            resizedImageData = canvas.toDataURL('image/jpeg', quality);

            // Reduce quality until file size is acceptable
            while (
              getBase64Size(resizedImageData) > MAX_FILE_SIZE &&
              quality > 0.1
            ) {
              quality -= 0.1;
              resizedImageData = canvas.toDataURL('image/jpeg', quality);
            }

            // If still too large, try with smaller dimensions
            if (getBase64Size(resizedImageData) > MAX_FILE_SIZE) {
              const reductionFactor = Math.sqrt(
                MAX_FILE_SIZE / getBase64Size(resizedImageData)
              );
              const newWidth = Math.floor(width * reductionFactor);
              const newHeight = Math.floor(height * reductionFactor);

              canvas.width = newWidth;
              canvas.height = newHeight;
              ctx.drawImage(img, 0, 0, newWidth, newHeight);
              resizedImageData = canvas.toDataURL('image/jpeg', 0.7);
            }
          }

          resolve(resizedImageData);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageData;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Checks if an image needs resizing for Google Sheets
 * @param imageData - Base64 data URL of the image
 * @returns boolean - True if image needs resizing
 */
export const needsResizing = (imageData: string): boolean => {
  const size = getBase64Size(imageData);
  return size > MAX_FILE_SIZE;
};

/**
 * Gets the dimensions of an image from base64 data
 * @param imageData - Base64 data URL of the image
 * @returns Promise<{width: number, height: number}>
 */
export const getImageDimensions = (
  imageData: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
};
