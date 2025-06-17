import generateImage from './lib/openai';
import getUserEmail from './session';
import { onOpen, openSidebar, openHelpDialog, openAboutUsDialog } from './ui';
import { insertTextToDoc, insertImageToDoc } from './document';

// Public functions must be exported as named exports
export {
  onOpen,
  openSidebar,
  openHelpDialog,
  openAboutUsDialog,
  generateImage,
  getUserEmail,
  insertTextToDoc,
  insertImageToDoc,
};
