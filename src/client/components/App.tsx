import * as React from 'react';
import { Edit3, Sparkles } from 'lucide-react';
import Navigation from './Navigation';
import ImageGenerator from './ImageGenerator';
import ImageEditor from './ImageEditor';
import ImageEditorAI from './ImageEditorAI';
import Settings from './Settings';
import { Toaster } from './ui/sonner';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import Spinner from './ui/spinner';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { useUserCredits } from '../hooks/useUserCredits';
import { useToast } from '../hooks/useToast';

type Page = 'home' | 'settings';

// Messages for the loader - each displays for 5 seconds
const loadingMessages = [
  'Mixing colors...',
  'Adding magic...',
  'Dreaming pixels...',
  'Creating art...',
  'Crafting image...',
  'Almost done...',
];

// Custom hook for message rotation
const useLoadingMessages = (isGenerating: boolean) => {
  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);

  React.useEffect(() => {
    if (!isGenerating) {
      setCurrentMessageIndex(0);
      return undefined;
    }

    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        // Stay on the last message once we reach it
        return nextIndex >= loadingMessages.length - 1
          ? loadingMessages.length - 1
          : nextIndex;
      });
    }, 5000); // Change message every 5 seconds

    return () => clearInterval(interval);
  }, [isGenerating]);

  return loadingMessages[currentMessageIndex];
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState<Page>('home');
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

  return (
    <div className="h-screen flex flex-col bg-white">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      <Toaster position="top-center" />
      <div className="flex-1 overflow-hidden">
        {currentPage === 'home' && (
          <Tabs defaultValue="generate" className="h-full flex flex-col">
            <div className="flex justify-center">
              <TabsList>
                <TabsTrigger value="generate">
                  <Sparkles className="w-4 h-4" />
                  Generate AI
                </TabsTrigger>
                <TabsTrigger value="edit-ai">
                  <Sparkles className="w-4 h-4" />
                  Edit AI
                </TabsTrigger>
                <TabsTrigger value="edit">
                  <Edit3 className="w-4 h-4" />
                  Edit
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="flex-1 overflow-hidden">
              <TabsContent value="generate" className="h-full overflow-auto">
                <ImageGenerator
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
              </TabsContent>
              <TabsContent value="edit-ai" className="h-full overflow-auto">
                <ImageEditorAI
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
              </TabsContent>
              <TabsContent value="edit" className="h-full overflow-auto">
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
              </TabsContent>
            </div>
          </Tabs>
        )}
        {currentPage === 'settings' && <Settings />}
      </div>

      {/* Persistent Generate Button - Only shown on home page */}
      {currentPage === 'home' && (
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
                <span>Generate Image</span>
              </div>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default App;
