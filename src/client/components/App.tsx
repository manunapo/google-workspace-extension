import * as React from 'react';
import { Toaster } from './ui/sonner';
import AppHeader from './AppHeader';
import NavigationMenu from './NavigationMenu';
import ToolPage from './ToolPage';
import ProfilePage from './ProfilePage';
import type { Tool } from '../../config';
import { availableTools } from '../../config';
import { useToast } from '../hooks/useToast';
import { useUserCredits } from '../hooks/useUserCredits';
import { serverFunctions } from '../utils/serverFunctions';
import { processImageParameters } from '../utils/images';

// Types for the app state
type AppPage = 'tool' | 'profile';

interface AppState {
  currentPage: AppPage;
  currentTool: Tool | null;
  isMenuOpen: boolean;
  isExecuting: boolean;
}

const App: React.FC = () => {
  // Main app state
  const [state, setState] = React.useState<AppState>({
    currentPage: 'tool',
    currentTool: null, // No tool selected initially
    isMenuOpen: true, // Start with menu open as landing page
    isExecuting: false,
  });

  const { showError, showSuccess } = useToast();
  const { refreshCredits } = useUserCredits();

  // Generated image state
  const [generatedImage, setGeneratedImage] = React.useState<string | null>(
    null
  );
  const [lastGeneratedImage, setLastGeneratedImage] = React.useState<
    string | null
  >(null);

  // Handle navigation actions
  const navigateToTool = React.useCallback((tool: Tool) => {
    setState((prev) => ({
      ...prev,
      currentPage: 'tool',
      currentTool: tool,
      isMenuOpen: false,
    }));
  }, []);

  const navigateToProfile = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentPage: 'profile',
      isMenuOpen: false,
    }));
  }, []);

  const toggleMenu = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      isMenuOpen: !prev.isMenuOpen,
    }));
  }, []);

  const closeMenu = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      isMenuOpen: false,
    }));
  }, []);

  // Execute tool with parameters
  const executeToolAction = React.useCallback(
    async (toolId: string, parameters: Record<string, unknown>) => {
      setState((prev) => ({ ...prev, isExecuting: true }));

      try {
        // Find the tool configuration to get credits
        const tool = availableTools.find((t: Tool) => t.id === toolId);
        if (!tool) {
          throw new Error(`Tool ${toolId} not found`);
        }

        // Process all image parameters in one pass
        const processedParameters = await processImageParameters(
          tool.parameters,
          parameters
        );

        // Call the unified tool executor
        const result = await serverFunctions.executeTool(
          toolId,
          tool.credits,
          processedParameters
        );

        // Update generated image state if result is an image
        if (result && typeof result === 'string') {
          setGeneratedImage(result);
          setLastGeneratedImage(result);
        }

        // Refresh credits after successful execution
        refreshCredits();

        showSuccess(`Successfully executed ${tool.name}!`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Tool execution failed';
        showError(errorMessage);
      } finally {
        setState((prev) => ({ ...prev, isExecuting: false }));
      }
    },
    [
      showError,
      showSuccess,
      refreshCredits,
      setGeneratedImage,
      setLastGeneratedImage,
    ]
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toast notifications */}
      <Toaster position="top-center" />

      {/* Header - Always visible */}
      <AppHeader
        currentTool={state.currentTool}
        currentPage={state.currentPage}
        isMenuOpen={state.isMenuOpen}
        onMenuClick={toggleMenu}
        onProfileClick={navigateToProfile}
      />

      {/* Navigation Menu - Overlay */}
      <NavigationMenu
        isOpen={state.isMenuOpen}
        onClose={closeMenu}
        onToolSelect={navigateToTool}
        onProfileSelect={navigateToProfile}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {state.currentPage === 'profile' && <ProfilePage />}

        {state.currentPage === 'tool' && state.currentTool && (
          <ToolPage
            tool={state.currentTool}
            onExecute={executeToolAction}
            isExecuting={state.isExecuting}
            generatedImage={generatedImage}
            lastGeneratedImage={lastGeneratedImage}
          />
        )}

        {state.currentPage === 'tool' && !state.currentTool && (
          <div className="h-full flex flex-col items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">🤖</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                No Tool Selected
              </h2>
              <p className="text-gray-600 mb-4 max-w-sm">
                Choose an AI tool from the menu to get started with your
                creative projects.
              </p>
              <button
                onClick={toggleMenu}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Browse Tools
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
