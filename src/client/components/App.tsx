import * as React from 'react';
import { Edit3, Sparkles } from 'lucide-react';
import Navigation from './Navigation';
import ImageGenerator from './ImageGenerator';
import ImageEditor from './ImageEditor';
import ImageEditorAI from './ImageEditorAI';
import Settings from './Settings';
import { Toaster } from './ui/sonner';
import { Button } from './ui/button';
import Spinner from './ui/spinner';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { useUserCredits } from '../hooks/useUserCredits';
import { useToast } from '../hooks/useToast';

type Page = 'home' | 'settings';

const useLoadingMessages = (isGenerating: boolean) => {
  const [messageIndex, setMessageIndex] = React.useState(0);
  const messages = [
    'Generating image...',
    'Almost done...',
    'Finalizing your image...',
  ];

  React.useEffect(() => {
    if (!isGenerating) {
      setMessageIndex(0);
      return undefined;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev < messages.length - 1) {
          return prev + 1;
        }
        return prev; // Stop incrementing at the last message
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isGenerating, messages.length]);

  return messages[messageIndex];
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState<Page>('home');
  const [currentTab, setCurrentTab] = React.useState('generate');

  // Shared generation state and form data
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [prompt, setPrompt] = React.useState('');
  const [transparentBackground, setTransparentBackground] =
    React.useState(false);
  const [temperature, setTemperature] = React.useState(0.7);
  const [lastGeneratedImage, setLastGeneratedImage] = React.useState<
    string | null
  >(null);

  const { generationState, generateImage } = useImageGeneration();
  const currentLoadingMessage = useLoadingMessages(
    generationState.isGenerating
  );
  const { hasEnoughCredits, refreshCredits } = useUserCredits(true);
  const { showError } = useToast();

  // Load last generated image from localStorage on mount
  React.useEffect(() => {
    try {
      const savedImage = localStorage.getItem('getstyled-last-generated-image');
      if (savedImage) {
        setLastGeneratedImage(savedImage);
      }
    } catch (error) {
      console.error('Error loading saved image from localStorage:', error);
    }
  }, []);

  React.useEffect(() => {
    refreshCredits();
  }, []);

  // Save generated image to localStorage whenever a new one is generated
  React.useEffect(() => {
    if (generationState.generatedImage) {
      try {
        localStorage.setItem(
          'getstyled-last-generated-image',
          generationState.generatedImage
        );
        setLastGeneratedImage(generationState.generatedImage);
      } catch (error) {
        console.error('Error saving image to localStorage:', error);
      }
    }
  }, [generationState.generatedImage]);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleGenerate = async () => {
    if (!hasEnoughCredits()) {
      setCurrentPage('settings');
      showError(
        'Insufficient credits to generate image. Please purchase more credits.'
      );
      return;
    }
    let imageData = null;

    if (selectedImage) {
      const reader = new FileReader();
      imageData = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target?.result);
        reader.readAsDataURL(selectedImage);
      });
    }

    try {
      await generateImage(
        prompt,
        imageData as string | null,
        transparentBackground,
        temperature
      );
    } finally {
      // Always refresh credits after generation attempt to ensure local state is up to date
      // This handles both successful generations and cases where credits were decremented before an error
      refreshCredits();
    }
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      <Toaster position="top-center" />
      <div className="flex-1 overflow-hidden">
        {currentPage === 'home' && (
          <div className="h-full flex flex-col">
            <div className="flex justify-center">
              <div className="flex border-b border-gray-200 mb-2">
                <button
                  onClick={() => handleTabChange('generate')}
                  className={`flex items-center px-2 py-2 text-nowrap overflow-hidden gap-2 text-sm font-medium transition-colors border-b-2 ${
                    currentTab === 'generate'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Generate AI
                </button>
                <button
                  onClick={() => handleTabChange('edit-ai')}
                  className={`flex items-center px-2 py-2 text-nowrap overflow-hidden gap-2 text-sm font-medium transition-colors border-b-2 ${
                    currentTab === 'edit-ai'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Edit AI
                </button>
                <button
                  onClick={() => handleTabChange('edit')}
                  className={`flex items-center px-2 py-2 text-nowrap overflow-hidden gap-2 text-sm font-medium transition-colors border-b-2 ${
                    currentTab === 'edit'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-white">
              {currentTab === 'generate' && (
                <div className="h-full overflow-auto">
                  <ImageGenerator
                    selectedImage={selectedImage}
                    setSelectedImage={setSelectedImage}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    temperature={temperature}
                    setTemperature={setTemperature}
                    generationState={generationState}
                    lastGeneratedImage={lastGeneratedImage}
                    transparentBackground={transparentBackground}
                    setTransparentBackground={setTransparentBackground}
                  />
                </div>
              )}
              {currentTab === 'edit-ai' && (
                <div className="h-full overflow-auto">
                  <ImageEditorAI
                    selectedImage={selectedImage}
                    setSelectedImage={setSelectedImage}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    temperature={temperature}
                    setTemperature={setTemperature}
                    generationState={generationState}
                    lastGeneratedImage={lastGeneratedImage}
                    transparentBackground={transparentBackground}
                    setTransparentBackground={setTransparentBackground}
                  />
                </div>
              )}
              {currentTab === 'edit' && (
                <div className="h-full overflow-auto">
                  <ImageEditor
                    selectedImage={selectedImage}
                    setSelectedImage={setSelectedImage}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    transparentBackground={transparentBackground}
                    setTransparentBackground={setTransparentBackground}
                    temperature={temperature}
                    setTemperature={setTemperature}
                    generationState={generationState}
                    lastGeneratedImage={lastGeneratedImage}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {currentPage === 'settings' && <Settings />}
      </div>

      {/* Persistent Generate Button - Only shown on home page and not in edit tab */}
      {currentPage === 'home' && currentTab !== 'edit' && (
        <div className="p-4 bg-white border-t border-gray-200">
          <Button
            onClick={handleGenerate}
            disabled={generationState.isGenerating || !prompt.trim()}
            className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
          >
            {generationState.isGenerating ? (
              <div className="flex items-center text-white gap-2">
                <Spinner size="sm" />
                <span>{currentLoadingMessage}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5" />
                <span>
                  {currentTab === 'edit-ai' ? 'Edit Image' : 'Generate Image'}
                </span>
              </div>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default App;
