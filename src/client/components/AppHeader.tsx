import * as React from 'react';
import { Menu, Coins } from 'lucide-react';
import { Tool } from '../../config';
import { useUserCredits } from '../hooks/useUserCredits';

interface AppHeaderProps {
  currentTool: Tool | null;
  currentPage: 'tool' | 'profile';
  isMenuOpen: boolean;
  onMenuClick: () => void;
  onProfileClick: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  currentTool,
  currentPage,
  isMenuOpen,
  onMenuClick,
  onProfileClick,
}) => {
  const { getCreditsDisplay, loading: creditsLoading } = useUserCredits(true);

  const getDisplayTitle = () => {
    if (isMenuOpen) {
      return 'Menu';
    }
    if (currentPage === 'profile') {
      return 'Account';
    }
    return currentTool ? currentTool.name : 'Select Tool';
  };

  const showCredits = currentPage !== 'profile';
  const showMenuButton = !isMenuOpen;

  return (
    <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center space-x-2">
      {showMenuButton && (
        <button
          onClick={onMenuClick}
          className="p-1 hover:scale-110 hover:bg-gray-200 rounded transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4 text-gray-600" />
        </button>
      )}

      <div className="truncate">
        <p className="text-sm font-medium text-gray-900 truncate">
          {getDisplayTitle()}
        </p>
      </div>

      <div className="flex-1"></div>

      {showCredits && (
        <button
          onClick={onProfileClick}
          className="flex items-center space-x-1 px-2 py-1 bg-green-50 hover:bg-green-100 rounded-full transition-colors"
          title={`Available credits: ${getCreditsDisplay()}`}
        >
          <Coins className="h-3 w-3 text-green-600" />
          <span className="text-xs font-medium text-green-600">
            {creditsLoading ? '...' : getCreditsDisplay()}
          </span>
        </button>
      )}
    </div>
  );
};

export default AppHeader;
