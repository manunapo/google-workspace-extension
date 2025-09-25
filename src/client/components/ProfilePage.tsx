import * as React from 'react';
import {
  CreditCard,
  Mail,
  Coins,
  Play,
  HelpCircle,
  MessageCircle,
  Star,
} from 'lucide-react';
import { Button } from './ui/button';
import Alert from './ui/alert';
import { serverFunctions } from '../utils/serverFunctions';
import { useUserCredits } from '../hooks/useUserCredits';
import { VERSION, DEFAULT_REVIEW_CREDITS } from '../../constants';

const ProfilePage: React.FC = () => {
  const [userEmail, setUserEmail] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [canClaimReviewCredits, setCanClaimReviewCredits] =
    React.useState<boolean>(false);
  const [claimingReviewCredits, setClaimingReviewCredits] =
    React.useState<boolean>(false);
  const [showReviewGif, setShowReviewGif] = React.useState<boolean>(false);
  const [reviewInstructionsShown, setReviewInstructionsShown] =
    React.useState<boolean>(false);

  const {
    credits,
    loading: creditsLoading,
    getCreditsDisplay,
    refreshCredits,
  } = useUserCredits(true);

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

  React.useEffect(() => {
    const checkReviewCreditsStatus = async () => {
      try {
        const status = await serverFunctions.checkReviewCreditsStatus();
        setCanClaimReviewCredits(status.canClaim);
      } catch (err) {
        // Assume they can claim if check fails
        setCanClaimReviewCredits(true);
      }
    };

    checkReviewCreditsStatus();
  }, []);

  const handleBuyCredits = () => {
    window.open('https://getstyled.art/addon/pricing', '_blank');
  };

  const handleOpenTutorial = () => {
    serverFunctions.openTutorialDialog();
  };

  const handleShowReviewInstructions = () => {
    if (!canClaimReviewCredits) return;

    setShowReviewGif(true);
    setReviewInstructionsShown(true);
  };

  const handleGoToReview = () => {
    setShowReviewGif(false);
    window.open(
      'https://workspace.google.com/marketplace/app/gpt_image_generator/276320676536',
      '_blank'
    );
  };

  const handleClaimReviewCredits = async () => {
    if (!canClaimReviewCredits || claimingReviewCredits) return;

    setClaimingReviewCredits(true);
    try {
      const result = await serverFunctions.grantReviewCredits();
      if (result.success) {
        setCanClaimReviewCredits(false);
        await refreshCredits();
        setShowReviewGif(false);
        setReviewInstructionsShown(false);
        setError(null);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to claim review credits'
      );
    } finally {
      setClaimingReviewCredits(false);
    }
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
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-green-500" />
              <h2 className="text-base font-semibold text-gray-800">
                Credits & Billing
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            {/* Credit Balance Card */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-700 uppercase tracking-wide">
                    Current Balance
                  </p>
                  <div className="text-2xl font-bold text-green-800 mt-1">
                    {creditsLoading ? (
                      <div className="animate-pulse bg-green-200 h-8 w-16 rounded"></div>
                    ) : (
                      <>
                        {getCreditsDisplay()}
                        <span className="text-sm font-normal text-green-600 ml-1">
                          credits
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Low Credits Warning */}
            {credits && credits.availableCredits <= 5 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800 flex items-center">
                  <span className="mr-2">⚠️</span>
                  You're running low on credits! Purchase more to continue using
                  AI tools.
                </p>
              </div>
            )}

            {/* Review Credits Section */}
            {canClaimReviewCredits && (
              <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg">
                <h3 className="text-sm font-medium text-gray-800 mb-1">
                  Get {DEFAULT_REVIEW_CREDITS} Free Credits!
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Rate our addon in the Google Workspace Marketplace with 5 ⭐
                  and get {DEFAULT_REVIEW_CREDITS} free credits instantly!
                </p>

                {/* Show GIF Instructions */}
                {showReviewGif && (
                  <div className="mb-3">
                    <img
                      src="https://getstyled.art/gifs/makeReview.gif"
                      alt="How to leave a review"
                      className="w-full rounded border mb-3"
                    />
                  </div>
                )}

                {!reviewInstructionsShown && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-800"
                    onClick={handleShowReviewInstructions}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    See How to Review
                  </Button>
                )}

                {reviewInstructionsShown && showReviewGif && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-800"
                      onClick={handleGoToReview}
                    >
                      <Star className="w-3 h-3 mr-1" />
                      Go Write Review
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800"
                      onClick={() => {
                        setShowReviewGif(false);
                        setReviewInstructionsShown(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {reviewInstructionsShown && !showReviewGif && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-800"
                    onClick={handleClaimReviewCredits}
                    disabled={claimingReviewCredits}
                  >
                    {claimingReviewCredits
                      ? 'Claiming...'
                      : "I've Written My Review - Claim"}
                  </Button>
                )}
              </div>
            )}

            {/* Purchase Section */}
            <div className="space-y-3">
              <p className="text-xs text-gray-600">
                Each AI tool uses different amounts of credits. Purchase more to
                keep creating amazing content.
              </p>

              <Button
                onClick={handleBuyCredits}
                disabled={loading || creditsLoading}
                className="w-full h-11 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Purchase Credits
              </Button>
            </div>
          </div>
        </div>

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
