import * as React from 'react';
import { Settings, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';

interface NavigationProps {
  currentPage: 'home' | 'settings';
  onNavigate: (page: 'home' | 'settings') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  return (
    <div className="flex items-center border-b border-gray-200 justify-between p-2 h-12 bg-white">
      <div className="flex items-center space-x-2">
        {currentPage === 'settings' && (
          <>
            <button
              onClick={() => onNavigate('home')}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Home
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 text-sm">Settings</span>
          </>
        )}
      </div>

      {currentPage === 'home' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('settings')}
          className="p-2"
        >
          <Settings className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
};

export default Navigation;
