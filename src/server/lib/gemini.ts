/* eslint-disable no-console */

import { GEMINI_API_KEY } from '../../constants';

export interface ImageGenerationOptions {
  prompt: string;
  temperature?: number;
  referenceImage?: string | null;
}

// Image generation function with Google Gemini integration using UrlFetchApp
export async function generateGeminiImage(
  prompt: string,
  referenceImage?: string | null,
  temperature = 0.7
): Promise<string> {
  try {
    console.log('Generating image with Google Gemini gemini-2.5-flash-image');
    console.log('Prompt:', prompt);
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

    parts.push({
      text: prompt,
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
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

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
      throw new Error('No image generated');
    }

    const candidate = data.candidates[0];
    console.log('Candidate structure:', JSON.stringify(candidate, null, 2));

    // Check finish reason for specific error conditions
    const { finishReason } = candidate;
    if (finishReason) {
      console.log('Finish reason:', finishReason);

      switch (finishReason) {
        case 'RECITATION':
          throw new Error(
            'Image generation blocked due to potential copyright or trademark content. Please modify your prompt to avoid references to specific brands, characters, or copyrighted material.'
          );
        case 'SAFETY':
          throw new Error(
            'Content safety violation detected. Please modify your prompt to avoid potentially harmful, offensive, or inappropriate content.'
          );
        case 'BLOCKED_REASON_UNSPECIFIED':
          throw new Error(
            'Content was blocked for unspecified reasons. Please try rephrasing your prompt.'
          );
        case 'FINISH_REASON_UNSPECIFIED':
          throw new Error(
            'Image generation stopped for unknown reasons. Please try again with a different prompt.'
          );
        case 'MAX_TOKENS':
          throw new Error(
            'Response was truncated due to length limits. Please try a shorter or simpler prompt.'
          );
        default:
          if (finishReason !== 'STOP') {
            throw new Error(
              `Image generation finished unexpectedly with reason: ${finishReason}. Please try modifying your prompt.`
            );
          }
      }
    }

    if (
      !candidate.content ||
      !candidate.content.parts ||
      candidate.content.parts.length === 0
    ) {
      throw new Error(
        'No content received from Gemini. The model may have blocked the request due to content policies.'
      );
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
      // Check if there's only text content
      const textParts = candidate.content.parts.filter(
        (part: { text?: string }) => part.text
      );

      if (textParts.length > 0) {
        const textContent = textParts
          .map((part: { text?: string }) => part.text)
          .join(' ');
        throw new Error(
          `Gemini returned text instead of an image: "${textContent}". This usually means your prompt was blocked due to content policies. Please try a different prompt avoiding copyrighted material, brands, or potentially harmful content.`
        );
      }

      throw new Error(
        "No image data found in the response. The content may have been blocked by Gemini's safety filters. Please try a different prompt."
      );
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
