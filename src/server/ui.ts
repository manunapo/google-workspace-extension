import { EXTENSION_NAME } from '../constants';

export const openAboutUsDialog = () => {
  const html = HtmlService.createHtmlOutputFromFile('about')
    .setWidth(600)
    .setHeight(350);
  DocumentApp.getUi().showModalDialog(html, EXTENSION_NAME);
};

export const openSidebar = () => {
  const html =
    HtmlService.createHtmlOutputFromFile('sidebar').setTitle(EXTENSION_NAME);
  DocumentApp.getUi().showSidebar(html);
};

export const openTutorialDialog = () => {
  const html = HtmlService.createHtmlOutputFromFile('tutorial')
    .setWidth(800)
    .setHeight(600);
  DocumentApp.getUi().showModalDialog(html, EXTENSION_NAME);
};

export const onOpen = (e: {
  user: { email: string };
  authMode: string;
  source: { getName: () => string };
}) => {
  // There may be not permissions here to use the Logger.
  // eslint-disable-next-line no-console
  console.log(
    `${e?.user?.email} - Auth mode: ${
      e?.authMode
    } - Source ${e?.source?.getName()}`
  );
  // https://developers.google.com/workspace/add-ons/concepts/menus
  DocumentApp.getUi()
    .createAddonMenu()
    .addItem('Launch', 'openSidebar')
    .addSeparator()
    .addItem('Tutorial', 'openTutorialDialog')
    .addItem('About Us', 'openAboutUsDialog')
    .addToUi();
};
