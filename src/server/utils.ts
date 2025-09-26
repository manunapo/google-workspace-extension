/**
 * Convert image URL to base64 data URL
 */
export function convertUrlToBase64(
  imageUrl: string,
  errorMessage: string
): string {
  try {
    console.log('Converting Magic Hour image URL to base64:', imageUrl);

    // Fetch the image from the URL
    const response = UrlFetchApp.fetch(imageUrl);

    if (response.getResponseCode() !== 200) {
      console.log(`Failed to fetch image: ${response.getResponseCode()}`);
      throw new Error(errorMessage);
    }

    // Get the image data as a blob
    const blob = response.getBlob();
    const base64Data = Utilities.base64Encode(blob.getBytes());

    // Determine the MIME type from the content type or URL extension
    let mimeType = blob.getContentType();
    if (!mimeType || mimeType === 'application/octet-stream') {
      // Fallback: try to determine from URL extension
      if (imageUrl.toLowerCase().includes('.png')) {
        mimeType = 'image/png';
      } else if (
        imageUrl.toLowerCase().includes('.jpg') ||
        imageUrl.toLowerCase().includes('.jpeg')
      ) {
        mimeType = 'image/jpeg';
      } else if (imageUrl.toLowerCase().includes('.webp')) {
        mimeType = 'image/webp';
      } else {
        mimeType = 'image/jpeg'; // Default fallback
      }
    }

    const dataUrl = `data:${mimeType};base64,${base64Data}`;
    console.log(
      'Successfully converted Magic Hour image to base64, size:',
      dataUrl.length
    );

    return dataUrl;
  } catch (error) {
    console.error('Error converting Magic Hour image URL to base64:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`Failed to convert Magic Hour image: ${errorMsg}`);
    throw new Error(errorMessage);
  }
}

// Helper function to extract MIME type and extension from data URL
export function getImageInfo(dataUrl: string): {
  mimeType: string;
  extension: string;
} {
  if (dataUrl.startsWith('data:image/gif'))
    return { mimeType: 'image/gif', extension: 'gif' };
  if (dataUrl.startsWith('data:image/png'))
    return { mimeType: 'image/png', extension: 'png' };
  if (dataUrl.startsWith('data:image/jpeg'))
    return { mimeType: 'image/jpeg', extension: 'jpg' };
  if (dataUrl.startsWith('data:image/webp'))
    return { mimeType: 'image/webp', extension: 'webp' };
  return { mimeType: 'image/png', extension: 'png' }; // fallback
}
