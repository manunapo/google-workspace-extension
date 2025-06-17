import * as React from 'react';
import { Settings, ArrowLeft, Sparkles, Coins } from 'lucide-react';
import { Button } from './ui/button';

interface NavigationProps {
  currentPage: 'home' | 'settings';
  onNavigate: (page: 'home' | 'settings') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const [credits, setCredits] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCredits = async () => {
      try {
        // TODO: Add serverFunctions.getCredits() when available
        // For now, we'll simulate credits data
        setCredits(0); // Set to 0 to show nothing
        // setCredits(25); // Use this to test with credits available
      } catch (error) {
        console.error('Failed to fetch credits:', error);
        setCredits(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, [currentPage]); // Refetch when page changes

  const renderCreditsOrButton = () => {
    if (loading) {
      return <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>;
    }

    if (credits !== null && credits > 0) {
      return (
        <div className="flex items-center gap-1">
          <Coins className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-gray-900">
            {credits} credits
          </span>
        </div>
      );
    }

    // Show nothing when no credits
    return null;
  };

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
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              {renderCreditsOrButton()}
            </div>
          </div>
        )}
      </div>

      {currentPage === 'home' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('settings')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </Button>
      )}
    </div>
  );
};

export default Navigation;
