import * as React from 'react';
import { User, CreditCard, Mail, Coins } from 'lucide-react';
import { Button } from './ui/button';
import Alert from './ui/alert';
import { serverFunctions } from '../utils/serverFunctions';

const Settings: React.FC = () => {
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

  const handleBuyCredits = () => {
    // TODO: Implement credit purchase logic
    console.log('Buy credits clicked');
  };

  const clearError = () => setError(null);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">
              Manage your account and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {error && (
          <Alert variant="error" onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Account Information */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-medium text-gray-800">
              Account Information
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Email Address
                </p>
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-4 w-48 rounded mt-1"></div>
                ) : (
                  <p className="text-sm text-gray-900 mt-1">
                    {userEmail || 'Not available'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Credits & Billing */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Coins className="w-4 h-4 text-green-500" />
            <h2 className="text-sm font-medium text-gray-800">
              Credits & Billing
            </h2>
          </div>

          <div className="space-y-4">
            {/* Credit Balance Card */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-700 uppercase tracking-wide">
                    Current Balance
                  </p>
                  <p className="text-2xl font-bold text-green-800 mt-1">
                    --
                    <span className="text-sm font-normal text-green-600 ml-1">
                      credits
                    </span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Purchase Section */}
            <div className="space-y-3">
              <p className="text-xs text-gray-600">
                Each image generation uses 1 credit. Purchase more credits to
                keep creating amazing visuals.
              </p>

              <Button
                onClick={handleBuyCredits}
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Purchase Credits
              </Button>
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-medium text-gray-800 mb-3">Need Help?</h2>
          <div className="text-xs text-gray-600 space-y-2">
            <p>
              Having trouble with image generation? Check out our help guides or
              contact support.
            </p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="text-xs">
                Help Guide
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
