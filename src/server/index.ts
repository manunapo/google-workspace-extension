import {
  generateImage,
  getUserCredits,
  insertImageToTarget,
  executeTool,
} from './manager';
import getUserEmail from './session';
import {
  onOpen,
  onInstall,
  openSidebar,
  openAboutUsDialog,
  openTutorialDialog,
  authorizeAddon,
  showHelp,
} from './ui';

// Public functions must be exported as named exports
export {
  onOpen,
  onInstall,
  openSidebar,
  openAboutUsDialog,
  generateImage,
  getUserEmail,
  insertImageToTarget,
  getUserCredits,
  openTutorialDialog,
  authorizeAddon,
  showHelp,
  executeTool,
};
