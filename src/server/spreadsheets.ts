// Insert image into the current spreadsheet at the active cell
export const insertImageToSheet = (imageData: string): void => {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();
    const activeRange = sheet.getActiveRange();

    // Convert base64 data URL to blob
    const base64Data = imageData.split(',')[1]; // Remove data:image/...;base64, part
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      'image/png',
      'generated-image.png'
    );

    // Check if blob is too large for Google Sheets
    const blobSize = blob.getBytes().length;
    const MAX_BLOB_SIZE = 2 * 1024 * 1024; // 2MB in bytes

    if (blobSize > MAX_BLOB_SIZE) {
      const sizeMB = Math.round((blobSize / 1024 / 1024) * 100) / 100;
      throw new Error(
        `Image is too large for Google Sheets (${sizeMB}MB). ` +
          `Maximum size is 2MB. Please use a smaller image.`
      );
    }

    // Get the position to insert the image
    const row = activeRange.getRow();
    const column = activeRange.getColumn();

    // Insert the image at the active cell position
    sheet.insertImage(blob, column, row);
  } catch (error) {
    console.error('Error inserting image into sheet:', error);

    // Re-throw the error with the original message if it's already a size-related error
    if (error instanceof Error && error.message.includes('too large')) {
      throw error;
    }

    // Handle the specific Google Sheets blob size error
    if (
      error instanceof Error &&
      error.message.includes('blob was too large')
    ) {
      throw new Error(
        'Image is too large for Google Sheets. Maximum size is 2MB and 1 million pixels. ' +
          'Please use a smaller image or reduce the image quality.'
      );
    }

    throw new Error('Failed to insert image into spreadsheet');
  }
};

export default insertImageToSheet;
