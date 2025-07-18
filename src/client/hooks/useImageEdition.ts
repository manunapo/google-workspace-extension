import { useState, useCallback, useRef } from 'react';

export interface ImageEditionSettings {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  borderRadius: number;
  format: 'png' | 'jpg' | 'webp';
  quality: number;
}

export interface OriginalImageDimensions {
  width: number;
  height: number;
}

export interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UseImageEditionReturn {
  // Settings
  settings: ImageEditionSettings;
  updateSettings: (updates: Partial<ImageEditionSettings>) => void;

  // Crop
  cropSettings: CropSettings | null;
  setCropSettings: (crop: CropSettings | null) => void;
  isCropping: boolean;
  setIsCropping: (cropping: boolean) => void;

  // Preview
  previewUrl: string | null;
  generatePreview: (originalImage: File) => Promise<void>;

  // Export
  exportImage: (originalImage: File) => Promise<Blob>;

  // Initialize with image
  initializeWithImage: (originalImage: File) => Promise<void>;

  // Reset
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: ImageEditionSettings = {
  width: 512,
  height: 512,
  maintainAspectRatio: true,
  borderRadius: 0,
  format: 'png',
  quality: 0.9,
};

export const useImageEdition = (): UseImageEditionReturn => {
  const [settings, setSettings] =
    useState<ImageEditionSettings>(DEFAULT_SETTINGS);
  const [cropSettings, setCropSettings] = useState<CropSettings | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] =
    useState<OriginalImageDimensions | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const updateSettings = useCallback(
    (updates: Partial<ImageEditionSettings>) => {
      setSettings((prev) => {
        const newSettings = { ...prev, ...updates };

        // Use original image aspect ratio if available and maintainAspectRatio is true
        if (prev.maintainAspectRatio && originalDimensions) {
          const originalRatio =
            originalDimensions.height / originalDimensions.width;

          if (updates.width && originalDimensions.width > 0) {
            newSettings.height = Math.round(updates.width * originalRatio);
          } else if (updates.height && originalDimensions.height > 0) {
            newSettings.width = Math.round(updates.height / originalRatio);
          }
        }

        return newSettings;
      });
    },
    [originalDimensions]
  );

  const loadImage = useCallback((file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const applyEdits = useCallback(
    async (img: HTMLImageElement, canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.width;
      let sourceHeight = img.height;

      if (cropSettings) {
        sourceX = cropSettings.x;
        sourceY = cropSettings.y;
        sourceWidth = cropSettings.width;
        sourceHeight = cropSettings.height;
      }

      // eslint-disable-next-line no-param-reassign
      canvas.width = settings.width;
      // eslint-disable-next-line no-param-reassign
      canvas.height = settings.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (settings.borderRadius > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(0, 0, canvas.width, canvas.height, settings.borderRadius);
        ctx.clip();
      }

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      if (settings.borderRadius > 0) {
        ctx.restore();
      }
    },
    [settings, cropSettings]
  );

  const generatePreview = useCallback(
    async (originalImage: File) => {
      try {
        const img = await loadImage(originalImage);

        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }

        const canvas = canvasRef.current;
        await applyEdits(img, canvas);

        const previewDataUrl = canvas.toDataURL('image/png', 0.8);
        setPreviewUrl(previewDataUrl);
      } catch (error) {
        console.error('Error generating preview:', error);
      }
    },
    [applyEdits, loadImage]
  );

  const exportImage = useCallback(
    async (originalImage: File): Promise<Blob> => {
      const img = await loadImage(originalImage);

      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }

      const canvas = canvasRef.current;
      await applyEdits(img, canvas);

      return new Promise((resolve, reject) => {
        const mimeType =
          settings.format === 'jpg' ? 'image/jpeg' : `image/${settings.format}`;
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to export image'));
            }
          },
          mimeType,
          settings.quality
        );
      });
    },
    [applyEdits, loadImage, settings.format, settings.quality]
  );

  const initializeWithImage = useCallback(
    async (originalImage: File) => {
      const img = await loadImage(originalImage);

      // Update settings with actual image dimensions
      setSettings((prev) => ({
        ...prev,
        width: img.width,
        height: img.height,
      }));
      setOriginalDimensions({ width: img.width, height: img.height });
    },
    [loadImage]
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setCropSettings(null);
    setIsCropping(false);
    setPreviewUrl(null);
    setOriginalDimensions(null);
  }, []);

  return {
    settings,
    updateSettings,
    cropSettings,
    setCropSettings,
    isCropping,
    setIsCropping,
    previewUrl,
    generatePreview,
    exportImage,
    initializeWithImage,
    resetSettings,
  };
};
