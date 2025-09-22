/* eslint-disable no-console */

import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from '../../constants';

export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  tags?: string[];
  quality?: string;
}

export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  access_mode: string;
  original_filename: string;
}

// Simple function to generate Cloudinary signature
function generateSignature(
  params: Record<string, string>,
  apiSecret: string
): string {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  // Add API secret
  const stringToSign = `${sortedParams}${apiSecret}`;

  // Generate SHA1 hash (using Utilities.computeDigest in Google Apps Script)
  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_1,
    stringToSign
  );

  // Convert to hex string
  return hash
    .map((byte) => {
      const hex = (byte < 0 ? byte + 256 : byte).toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join('');
}

// Upload image to Cloudinary
export async function uploadImageToCloudinary(
  imageData: string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResponse> {
  try {
    console.log('Uploading image to Cloudinary');

    // Get Cloudinary credentials from script properties
    const cloudName = PropertiesService.getScriptProperties().getProperty(
      CLOUDINARY_CLOUD_NAME
    );
    const apiKey =
      PropertiesService.getScriptProperties().getProperty(CLOUDINARY_API_KEY);
    const apiSecret = PropertiesService.getScriptProperties().getProperty(
      CLOUDINARY_API_SECRET
    );

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Cloudinary credentials not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to script properties.'
      );
    }

    // Extract base64 data if it's a data URL
    const base64Data = imageData.includes(',')
      ? imageData.split(',')[1]
      : imageData;

    // Generate timestamp
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Prepare upload parameters
    const uploadParams: Record<string, string> = {
      timestamp,
      api_key: apiKey,
    };

    // Add optional parameters
    if (options.folder) {
      uploadParams.folder = options.folder;
    }
    if (options.public_id) {
      uploadParams.public_id = options.public_id;
    }
    if (options.tags && options.tags.length > 0) {
      uploadParams.tags = options.tags.join(',');
    }
    if (options.quality) {
      uploadParams.quality = options.quality;
    }

    // Generate signature
    const signature = generateSignature(uploadParams, apiSecret);
    uploadParams.signature = signature;

    // Add the image file
    uploadParams.file = `data:image/png;base64,${base64Data}`;

    // Cloudinary upload endpoint
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    // Create form data payload
    const formData = Object.keys(uploadParams)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(uploadParams[key])}`
      )
      .join('&');

    console.log('Making request to Cloudinary...');

    // Make the API request
    const response = UrlFetchApp.fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      payload: formData,
    });

    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode !== 200) {
      console.error('Cloudinary API Error:', responseCode, responseText);

      // Handle specific Cloudinary errors
      if (responseCode === 401) {
        throw new Error(
          'Invalid Cloudinary API credentials. Please check your configuration.'
        );
      } else if (responseCode === 400) {
        const errorData = JSON.parse(responseText);
        if (errorData.error && errorData.error.message) {
          throw new Error(`Cloudinary error: ${errorData.error.message}`);
        }
      }

      throw new Error(
        `Cloudinary API error: ${responseCode} - ${responseText}`
      );
    }

    const uploadResult: CloudinaryUploadResponse = JSON.parse(responseText);

    console.log('Image uploaded successfully to Cloudinary');
    console.log('Public URL:', uploadResult.secure_url);

    return uploadResult;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);

    if (error instanceof Error) {
      // Re-throw our custom errors
      throw error;
    }

    throw new Error('Failed to upload image to Cloudinary. Please try again.');
  }
}

// Convenience function to upload and get just the URL
export async function uploadImageAndGetUrl(
  imageData: string,
  options: CloudinaryUploadOptions = {}
): Promise<string> {
  const result = await uploadImageToCloudinary(imageData, options);
  return result.secure_url;
}

export default uploadImageToCloudinary;
