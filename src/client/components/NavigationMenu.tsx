import * as React from 'react';
import { User, Sparkles } from 'lucide-react';
import { availableTools } from '../../config';
import type { Tool } from '../../config';
import AppHeader from './AppHeader';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onToolSelect: (tool: Tool) => void;
  onProfileSelect: () => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  isOpen,
  onClose,
  onToolSelect,
  onProfileSelect,
}) => {
  if (!isOpen) return null;

  const handleToolClick = (tool: Tool) => {
    onToolSelect(tool);
    onClose();
  };

  const handleProfileClick = () => {
    onProfileSelect();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-20 z-40"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-50 flex flex-col max-w-full">
        {/* Header - Uses AppHeader for consistency */}
        <AppHeader
          currentTool={null}
          currentPage={'tool' as const}
          isMenuOpen={true}
          onMenuClick={() => {}}
          onProfileClick={onProfileSelect}
        />

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Section */}
          <div className="p-2 border-b border-gray-100">
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center space-x-3 p-3 hover:scale-105 hover:bg-slate-50 rounded-lg transition-all duration-200 text-left border border-transparent hover:border-slate-200 hover:shadow-sm"
            >
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                <User className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">
                  Account
                </div>
                <div className="text-xs text-slate-600">
                  Profile, credits, and support.
                </div>
              </div>
            </button>
          </div>

          {/* Tools Section */}
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
              Available Tools
            </div>
            <div className="space-y-1">
              {availableTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  className="w-full flex items-center p-3 hover:scale-105 hover:bg-blue-50 rounded-lg transition-all duration-200 text-left relative border border-transparent hover:border-blue-200 hover:shadow-sm"
                >
                  {tool.isNew && (
                    <span className="absolute top-0 right-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium text-green-600">
                      New
                    </span>
                  )}
                  <div className="flex w-full items-center space-x-2">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {tool.name}
                      </div>
                      <div className="text-xs w-full text-slate-600 truncate">
                        {tool.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t flex justify-end border-gray-100 p-2">
          <div className="text-xs text-slate-600">
            Need help?{' '}
            <a
              href="mailto:contact@getstyled.art"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              contact@getstyled.art
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavigationMenu;
