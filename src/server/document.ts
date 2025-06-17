// Insert text into the current document at the cursor position
/* eslint-disable import/prefer-default-export */
export const insertTextToDoc = (text: string): void => {
  const doc = DocumentApp.getActiveDocument();
  const cursor = doc.getCursor();

  if (cursor) {
    // Insert at cursor position
    const element = cursor.getElement();
    const offset = cursor.getOffset();

    // Check element type and insert text
    if (element.asText) {
      element.asText().insertText(offset, text);
    } else {
      // If we can't insert at cursor, append to body
      doc.getBody().appendParagraph(text);
    }
  } else {
    // No cursor, append to body
    doc.getBody().appendParagraph(text);
  }
};

// Insert image into the current document at the cursor position
export const insertImageToDoc = (imageData: string): void => {
  try {
    const doc = DocumentApp.getActiveDocument();
    const cursor = doc.getCursor();

    // Convert base64 data URL to blob
    const base64Data = imageData.split(',')[1]; // Remove data:image/...;base64, part
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      'image/png',
      'generated-image.png'
    );

    if (cursor) {
      // Insert at cursor position
      const element = cursor.getElement();

      // Try to insert after the current element
      const parent = element.getParent();
      const childIndex = parent.getChildIndex(element);

      // Insert a new paragraph with the image
      const body = doc.getBody();
      const paragraph = body.insertParagraph(childIndex + 1, '');
      paragraph.appendInlineImage(blob);
    } else {
      // No cursor, append to body
      const body = doc.getBody();
      const paragraph = body.appendParagraph('');
      paragraph.appendInlineImage(blob);
    }
  } catch (error) {
    console.error('Error inserting image:', error);
    throw new Error('Failed to insert image into document');
  }
};
