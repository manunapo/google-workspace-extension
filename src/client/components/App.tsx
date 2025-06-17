import * as React from 'react';
import Navigation from './Navigation';
import ImageGenerator from './ImageGenerator';
import Settings from './Settings';
import { Toaster } from './ui/sonner';

type Page = 'home' | 'settings';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState<Page>('home');

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />

      <div className="flex-1 overflow-hidden">
        {currentPage === 'home' && <ImageGenerator />}
        {currentPage === 'settings' && <Settings />}
      </div>

      <Toaster />
    </div>
  );
};

export default App;
