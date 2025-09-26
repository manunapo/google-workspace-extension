import { getImageInfo } from './utils';

// Insert image into the current presentation slide
export const insertImageToSlide = (imageData: string): void => {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const slide = presentation
      .getSelection()
      .getCurrentPage() as unknown as GoogleAppsScript.Slides.Slide;

    if (!slide) {
      throw new Error('No slide selected');
    }

    // Extract image info and convert base64 data URL to blob
    const imageInfo = getImageInfo(imageData);
    const base64Data = imageData.split(',')[1]; // Remove data:image/...;base64, part
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      imageInfo.mimeType,
      `generated-image.${imageInfo.extension}`
    );

    // Insert the image in the center of the slide
    const pageHeight = presentation.getPageHeight();
    const pageWidth = presentation.getPageWidth();

    // Center the image on the slide (adjust size as needed)
    const imageWidth = 300;
    const imageHeight = 200;
    const left = (pageWidth - imageWidth) / 2;
    const top = (pageHeight - imageHeight) / 2;

    slide.insertImage(blob, left, top, imageWidth, imageHeight);
  } catch (error) {
    console.error('Error inserting image into slide:', error);
    throw new Error('Failed to insert image into presentation');
  }
};

export default insertImageToSlide;
