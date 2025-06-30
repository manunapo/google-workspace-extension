import * as React from 'react';
import { Settings, ArrowLeft } from 'lucide-react';

interface NavigationProps {
  currentPage: 'home' | 'settings';
  onNavigate: (page: 'home' | 'settings') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200 shadow-sm h-16">
      <div className="flex items-center gap-3">
        {currentPage === 'settings' ? (
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex justify-start align-middle gap-2">
              <img
                src="https://getstyled.art/icons/logo_v2_96.webp"
                alt="Logo"
                className="w-8 h-8"
              />
              <h1 className="text-xl font-bold">getstyled.art</h1>
            </div>
          </div>
        )}
      </div>

      {currentPage === 'home' && (
        <button onClick={() => onNavigate('settings')}>
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default Navigation;
