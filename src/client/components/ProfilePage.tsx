import * as React from 'react';
import { Mail, Play, HelpCircle, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import Alert from './ui/alert';
import { serverFunctions } from '../utils/serverFunctions';
import { VERSION } from '../../constants';
import Pricing from './Pricing';

const ProfilePage: React.FC = () => {
  const [userEmail, setUserEmail] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const email = await serverFunctions.getUserEmail();
        setUserEmail(email || 'Not available');
      } catch (err) {
        setError('Failed to load user information');
      } finally {
        setLoading(false);
      }
    };

    fetchUserEmail();
  }, []);

  const handleOpenTutorial = () => {
    serverFunctions.openTutorialDialog();
  };

  const handlePricingError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const clearError = () => setError(null);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <Alert variant="error" onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Account Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-800">
              Account Information
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 pb-0 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Email Address
                </p>
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-4 w-48 rounded mt-1"></div>
                ) : (
                  <p className="text-sm text-gray-900 mt-1 break-all">
                    {userEmail || 'Not available'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Credits & Billing */}
        <Pricing showTitle={true} onError={handlePricingError} />

        {/* Help & Support */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-semibold text-gray-800">
              Help & Support
            </h2>
          </div>

          <div className="space-y-4">
            {/* Tutorial Section */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-blue-600 ml-0.5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-800 mb-1">
                    Video Tutorial
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Watch our quick tutorial to learn how to use all the AI
                    tools effectively.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-white hover:bg-blue-50 border-blue-200"
                    onClick={handleOpenTutorial}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Watch Tutorial
                  </Button>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-800 mb-1">
                    Get Support
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Need help? Our support team is here to assist you with any
                    questions or issues (v{VERSION}).
                  </p>
                  <a
                    href="mailto:contact@getstyled.art"
                    className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    contact@getstyled.art
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
