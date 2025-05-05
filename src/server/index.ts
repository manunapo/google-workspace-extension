import { onOpen, openSidebar, openHelpDialog, openAboutUsDialog } from './ui';

import { getSheetsData, addSheet, deleteSheet, setActiveSheet } from './sheets';
import { insertTextToDoc } from './document';

// Public functions must be exported as named exports
export {
  onOpen,
  openSidebar,
  openHelpDialog,
  openAboutUsDialog,
  getSheetsData,
  addSheet,
  deleteSheet,
  setActiveSheet,
  insertTextToDoc,
};
