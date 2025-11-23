import {
  getUserCredits,
  insertImageToTarget,
  executeTool,
  uploadImageAndGetUrl,
  grantReviewCredits,
  checkReviewCreditsStatus,
  purchaseCredits,
  openBillingPortal,
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
  getUserEmail,
  insertImageToTarget,
  getUserCredits,
  openTutorialDialog,
  authorizeAddon,
  showHelp,
  executeTool,
  uploadImageAndGetUrl,
  grantReviewCredits,
  checkReviewCreditsStatus,
  purchaseCredits,
  openBillingPortal,
};
