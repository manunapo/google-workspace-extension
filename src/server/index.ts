import { generateImage, getUserCredits } from './manager';
import getUserEmail from './session';
import {
  onOpen,
  openSidebar,
  openAboutUsDialog,
  openTutorialDialog,
} from './ui';
import { insertTextToDoc, insertImageToDoc } from './document';

// Public functions must be exported as named exports
export {
  onOpen,
  openSidebar,
  openAboutUsDialog,
  generateImage,
  getUserEmail,
  insertTextToDoc,
  insertImageToDoc,
  getUserCredits,
  openTutorialDialog,
};
