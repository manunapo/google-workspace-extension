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
