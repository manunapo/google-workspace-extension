import { EXTENSION_NAME } from '../constants';
import { ScriptContextType } from '../types';

export function getScriptContext(): ScriptContextType {
  try {
    const ui = SpreadsheetApp.getUi(); // Try to get the UI for a spreadsheet
    if (ui) {
      // The script is likely running in a Google Sheet
      console.log('Running in a Google Sheet');
      return 'sheets';
      // You can then use SpreadsheetApp methods
    }
  } catch (_eSheet) {
    try {
      const docUi = DocumentApp.getUi(); // Try to get the UI for a document
      if (docUi) {
        console.log('Running in a Google Doc');
        return 'docs';
      }
    } catch (eDoc) {
      console.log(`Running in another context, e: ${eDoc}`);
      try {
        const slideUi = SlidesApp.getUi(); // Try to get the UI for a document
        if (slideUi) {
          console.log('Running in a Google Slide');
          return 'slides';
        }
      } catch (eSlide) {
        console.log(`Running in another context, e: ${eSlide}`);
        throw new Error('Unknown script context');
      }
    }
  }
  console.log('Running in another context');
  throw new Error('Unknown script context');
}

function getActiveUiForContext(context: ScriptContextType) {
  switch (context) {
    case 'docs':
      return DocumentApp.getUi();
    case 'slides':
      return SlidesApp.getUi();
    case 'sheets':
      return SpreadsheetApp.getUi();
    default:
      throw new Error('Unknown script context');
  }
}

function getActiveUi() {
  // Extension must be enabled for getUi to work
  // First determine the context to avoid authorization issues
  const context = getScriptContext();
  return getActiveUiForContext(context);
}

export const openAboutUsDialog = () => {
  const html = HtmlService.createHtmlOutputFromFile('about')
    .setWidth(600)
    .setHeight(350);
  getActiveUi().showModalDialog(html, EXTENSION_NAME);
};

export const openSidebar = () => {
  const html =
    HtmlService.createHtmlOutputFromFile('sidebar').setTitle(EXTENSION_NAME);
  getActiveUi().showSidebar(html);
};

export const openTutorialDialog = () => {
  const html = HtmlService.createHtmlOutputFromFile('tutorial')
    .setWidth(1280)
    .setHeight(720);
  getActiveUi().showModalDialog(html, EXTENSION_NAME);
};

export const onOpen = (e: {
  user: { email: string };
  authMode: string;
  source: { getName: () => string };
}) => {
  // Create a simple menu that works in all authorization modes
  // We'll use a very straightforward approach
  try {
    // Try to get the UI service for the current context
    let ui;

    // Simple approach: try each UI service and use the first one that works
    try {
      ui = SlidesApp.getUi();
    } catch (e1) {
      try {
        ui = DocumentApp.getUi();
      } catch (e2) {
        try {
          ui = SpreadsheetApp.getUi();
        } catch (e3) {
          // If none work, just return silently
          return;
        }
      }
    }

    // Create a simple menu that works in all authorization modes
    const menu = ui.createAddonMenu();

    // Always add the main menu items regardless of auth mode
    menu.addItem('Launch', 'openSidebar');
    menu.addSeparator();
    menu.addItem('Tutorial', 'openTutorialDialog');
    menu.addItem('About Us', 'openAboutUsDialog');

    // Add authorization item only if in limited mode
    if (e && e.authMode === 'NONE') {
      menu.addSeparator();
      menu.addItem('🔐 Authorize Add-on', 'authorizeAddon');
    }

    menu.addToUi();
  } catch (error) {
    // If there's an error, don't break the entire add-on
    // Just continue without a menu
  }
};

// Function to handle authorization - this will run in AuthMode.FULL when user clicks the menu
export const authorizeAddon = () => {
  try {
    // This function runs in AuthMode.FULL, so we can access all services
    console.log('Authorizing add-on...');

    // Force authorization by accessing a service that requires permissions
    const userEmail = Session.getActiveUser().getEmail();
    console.log(`Add-on authorized for user: ${userEmail}`);

    // Get the current context to show appropriate UI
    const context = getScriptContext();
    const ui = getActiveUiForContext(context);

    // Show success message and recreate the menu
    ui.alert(
      EXTENSION_NAME,
      'Add-on has been authorized successfully!\n\nYou can now use all features. Please refresh the page to see the full menu.',
      ui.ButtonSet.OK
    );

    // Recreate the full menu now that we're authorized
    ui.createAddonMenu()
      .addItem('Launch', 'openSidebar')
      .addSeparator()
      .addItem('Tutorial', 'openTutorialDialog')
      .addItem('About Us', 'openAboutUsDialog')
      .addToUi();
  } catch (error) {
    console.error('Error during authorization:', error);

    // Show error message to user
    try {
      const context = getScriptContext();
      const ui = getActiveUiForContext(context);
      ui.alert(
        EXTENSION_NAME,
        'Authorization failed. Please try again or contact support if the issue persists.',
        ui.ButtonSet.OK
      );
    } catch (uiError) {
      console.error('Could not show error dialog:', uiError);
    }
  }
};

// Function to show help information
export const showHelp = () => {
  try {
    const context = getScriptContext();
    const ui = getActiveUiForContext(context);

    ui.alert(
      EXTENSION_NAME,
      'This add-on helps you generate AI images directly in your Google Workspace documents.\n\n' +
        'To get started:\n' +
        '1. Click "🔐 Authorize Add-on" to grant necessary permissions\n' +
        '2. Refresh the page to see the full menu\n' +
        '3. Click "Launch" to open the sidebar\n\n' +
        'For more information, visit our tutorial after authorization.',
      ui.ButtonSet.OK
    );
  } catch (error) {
    console.error('Error showing help:', error);
  }
};

export const onInstall = (e: {
  user: { email: string };
  authMode: string;
  source: { getName: () => string };
}) => {
  onOpen(e);
};
