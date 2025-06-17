import * as React from 'react';
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
    <div className="p-4 space-y-6 max-w-md mx-auto">
      <div>
        {error && (
          <Alert variant="error" onClose={clearError} className="mb-4">
            {error}
          </Alert>
        )}

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Account Information
            </h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500">Email Address</label>
                <div className="text-sm text-gray-900">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-4 w-48 rounded"></div>
                  ) : (
                    userEmail || 'Not available'
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Credits & Billing
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Purchase credits to generate more AI images
            </p>
            <Button
              onClick={handleBuyCredits}
              className="w-full"
              disabled={loading}
            >
              Buy Credits
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
