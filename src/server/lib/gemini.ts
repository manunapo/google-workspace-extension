/* eslint-disable no-console */

import { GEMINI_API_KEY } from '../../constants';

export interface ImageGenerationOptions {
  prompt: string;
  transparentBackground?: boolean;
  temperature?: number;
  referenceImage?: string | null;
}

// Image generation function with Google Gemini integration using UrlFetchApp
export async function generateGeminiImage(
  prompt: string,
  referenceImage?: string | null,
  transparentBackground = false,
  temperature = 0.7
): Promise<string> {
  try {
    console.log(
      'Generating image with Google Gemini gemini-2.5-flash-image-preview'
    );
    console.log('Prompt:', prompt);
    console.log('Transparent Background:', transparentBackground);
    console.log('Temperature:', temperature);

    if (referenceImage) {
      console.log('Reference image provided - using image editing');
    }

    // Check if API key is configured
    const apiKey =
      PropertiesService.getScriptProperties().getProperty(GEMINI_API_KEY);
    if (!apiKey) {
      throw new Error(
        'Gemini API key not configured. Please add GEMINI_API_KEY to script properties.'
      );
    }

    // Prepare the request payload
    const parts: unknown[] = [];

    // Add the text prompt with transparency instruction if needed
    const enhancedPrompt = transparentBackground
      ? `${prompt}. Make sure the background is transparent.`
      : prompt;

    parts.push({
      text: enhancedPrompt,
    });

    // Add reference image if provided
    if (referenceImage) {
      const base64Data = referenceImage.includes(',')
        ? referenceImage.split(',')[1]
        : referenceImage;

      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: base64Data,
        },
      });
    }

    const payload = {
      contents: [
        {
          parts,
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: 4096,
      },
    };

    // Gemini API endpoint for the specified model
    const endpoint =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent';

    // Make the API request
    const response = UrlFetchApp.fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(payload),
    });

    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode !== 200) {
      console.error('Gemini API Error:', responseCode, responseText);

      // Handle specific Gemini errors
      if (responseCode === 401) {
        throw new Error(
          'Invalid Gemini API key. Please check your configuration.'
        );
      } else if (responseCode === 429) {
        throw new Error(
          'Gemini API quota exceeded. Please check your billing.'
        );
      } else if (responseCode === 400) {
        const errorData = JSON.parse(responseText);
        if (
          errorData.error &&
          errorData.error.message &&
          errorData.error.message.includes('SAFETY')
        ) {
          throw new Error(
            'Content safety violation. Please modify your prompt.'
          );
        }
      }

      throw new Error(`Gemini API error: ${responseCode} - ${responseText}`);
    }

    const data = JSON.parse(responseText);

    // Debug: Log the full response to understand the structure
    console.log('Full Gemini API response:', JSON.stringify(data, null, 2));

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No image generated from Gemini');
    }

    const candidate = data.candidates[0];
    console.log('Candidate structure:', JSON.stringify(candidate, null, 2));

    if (
      !candidate.content ||
      !candidate.content.parts ||
      candidate.content.parts.length === 0
    ) {
      throw new Error('No image content received from Gemini');
    }

    console.log(
      'Content parts:',
      JSON.stringify(candidate.content.parts, null, 2)
    );

    // Find the image part in the response (try both camelCase and snake_case)
    const imagePart = candidate.content.parts.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (part: any) => part.inlineData || part.inline_data
    );

    console.log('Found image part:', JSON.stringify(imagePart, null, 2));

    if (!imagePart) {
      throw new Error('No image data received from Gemini');
    }

    // Handle both camelCase (inlineData) and snake_case (inline_data) from API response
    const imageData = imagePart.inlineData || imagePart.inline_data;

    if (!imageData || !imageData.data) {
      throw new Error('No image data found in response');
    }

    // Get the base64 image data and mime type
    const imageBase64 = imageData.data;
    const mimeType = imageData.mimeType || imageData.mime_type || 'image/png';

    // Convert to data URL for display
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    console.log('Image generated successfully with Gemini');

    return dataUrl;
  } catch (error) {
    console.error('Error generating image with Gemini:', error);

    if (error instanceof Error) {
      // Re-throw our custom errors
      throw error;
    }

    throw new Error('Failed to generate image with Gemini. Please try again.');
  }
}

export default generateGeminiImage;
