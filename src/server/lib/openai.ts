/* eslint-disable no-console */

import { OPENAI_API_KEY } from '../../constants';

export interface ImageGenerationOptions {
  prompt: string;
  transparentBackground?: boolean;
  temperature?: number; // For future compatibility, not directly used in DALL-E
  referenceImage?: string | null;
}

// Image generation function with OpenAI integration using UrlFetchApp
export async function generateOpenAIImage(
  prompt: string,
  referenceImage?: string | null,
  transparentBackground = false,
  temperature = 0.7
): Promise<string> {
  try {
    console.log('Generating image with OpenAI gpt-image-1');
    console.log('Prompt:', prompt);
    console.log('Transparent Background:', transparentBackground);
    console.log('Temperature:', temperature);

    if (referenceImage) {
      console.log('Reference image provided - using edits endpoint');
    }

    // Check if API key is configured
    const apiKey =
      PropertiesService.getScriptProperties().getProperty(OPENAI_API_KEY);
    if (!apiKey) {
      throw new Error(
        'OpenAI API key not configured. Please add OPENAI_API_KEY to script properties.'
      );
    }

    let endpoint: string;
    let response: GoogleAppsScript.URL_Fetch.HTTPResponse;

    if (referenceImage) {
      // Use edits endpoint when reference image is provided
      endpoint = 'https://api.openai.com/v1/images/edits';

      // Convert base64 data URL to blob for form data
      const base64Data = referenceImage.includes(',')
        ? referenceImage.split(',')[1]
        : referenceImage;

      const imageBlob = Utilities.newBlob(
        Utilities.base64Decode(base64Data),
        'image/png',
        'reference.png'
      );

      // Prepare form data for edits endpoint
      const formData: Record<string, unknown> = {
        model: 'gpt-image-1',
        prompt,
        image: imageBlob,
        size: '1024x1024',
        quality: 'auto',
        output_format: transparentBackground ? 'png' : 'jpeg',
      };

      if (transparentBackground) {
        formData.background = 'transparent';
      }

      // Make the API request using form data
      response = UrlFetchApp.fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        payload: formData,
      });
    } else {
      // Use generate endpoint for new images
      endpoint = 'https://api.openai.com/v1/images/generations';

      const payload: Record<string, unknown> = {
        model: 'gpt-image-1',
        prompt,
        size: '1024x1024',
        quality: 'auto',
        output_format: transparentBackground ? 'png' : 'jpeg',
      };

      if (transparentBackground) {
        payload.background = 'transparent';
      }

      // Make the API request using JSON
      response = UrlFetchApp.fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        payload: JSON.stringify(payload),
      });
    }

    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode !== 200) {
      console.error('OpenAI API Error:', responseCode, responseText);

      // Handle specific OpenAI errors
      if (responseCode === 401) {
        throw new Error(
          'Invalid OpenAI API key. Please check your configuration.'
        );
      } else if (responseCode === 429) {
        throw new Error(
          'OpenAI API quota exceeded. Please check your billing.'
        );
      } else if (responseCode === 400) {
        const errorData = JSON.parse(responseText);
        if (
          errorData.error &&
          errorData.error.code === 'content_policy_violation'
        ) {
          throw new Error(
            'Content policy violation. Please modify your prompt.'
          );
        }
      }

      throw new Error(`OpenAI API error: ${responseCode} - ${responseText}`);
    }

    const data = JSON.parse(responseText);

    if (!data.data || data.data.length === 0) {
      throw new Error('No image generated from OpenAI');
    }

    // gpt-image-1 returns base64 data by default
    const imageBase64 = data.data[0].b64_json;
    if (!imageBase64) {
      throw new Error('No image data received from OpenAI');
    }

    // Convert base64 to data URL for display
    const outputFormat = transparentBackground ? 'png' : 'jpeg';
    const dataUrl = `data:image/${outputFormat};base64,${imageBase64}`;

    console.log('Image generated successfully');

    return dataUrl;
  } catch (error) {
    console.error('Error generating image:', error);

    if (error instanceof Error) {
      // Re-throw our custom errors
      throw error;
    }

    throw new Error('Failed to generate image. Please try again.');
  }
}

export default generateOpenAIImage;
