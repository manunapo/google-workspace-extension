import { useState, useEffect } from 'react';
import { serverFunctions } from '../utils/serverFunctions';
import { useToast } from './useToast';

export interface GenerationState {
  isGenerating: boolean;
  eta: number | null;
  generatedImage: string | null;
}

export interface ImageGenerationParams {
  prompt: string;
  referenceImage?: string | null;
  transparentBackground?: boolean;
  temperature?: number;
}

export const useImageGeneration = () => {
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    eta: null,
    generatedImage: null,
  });

  const { showSuccess, showError } = useToast();

  const generateImage = async (
    prompt: string,
    referenceImage?: string | null,
    transparentBackground = false,
    temperature = 0.7
  ) => {
    if (!prompt.trim()) {
      showError('Please enter a prompt to generate an image');
      return;
    }

    setGenerationState({
      isGenerating: true,
      eta: 30,
      generatedImage: null,
    });

    try {
      const result = await serverFunctions.generateImage(
        prompt,
        referenceImage,
        transparentBackground,
        temperature
      );

      setGenerationState((prev) => ({
        ...prev,
        generatedImage: result,
      }));

      // Automatically insert the image into the document
      try {
        await serverFunctions.insertImageToDoc(result);
        showSuccess('Image generated and inserted into document!');
      } catch (insertError) {
        console.warn('Failed to auto-insert image:', insertError);
        showSuccess(
          'Image generated successfully! Use the Insert button to add it to your document.'
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to generate image. Please try again.';
      showError(errorMessage);
    } finally {
      setGenerationState((prev) => ({
        ...prev,
        isGenerating: false,
        eta: null,
      }));
    }
  };

  useEffect(() => {
    let interval: number | null = null;

    if (
      generationState.isGenerating &&
      generationState.eta &&
      generationState.eta > 0
    ) {
      interval = setInterval(() => {
        setGenerationState((prev) => ({
          ...prev,
          eta: prev.eta ? Math.max(0, prev.eta - 1) : 0,
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generationState.isGenerating, generationState.eta]);

  return {
    generationState,
    generateImage,
  };
};
