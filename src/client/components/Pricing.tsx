import * as React from 'react';
import { CreditCard, Coins, Star, Zap, Check } from 'lucide-react';
import { Button } from './ui/button';
import { serverFunctions } from '../utils/serverFunctions';
import { useUserCredits } from '../hooks/useUserCredits';
import {
  DEFAULT_REVIEW_CREDITS,
  ESSENTIAL_CREDITS,
  ESSENTIAL_PRICE,
  PRO_CREDITS,
  PRO_PRICE,
} from '../../constants';

interface PricingProps {
  /**
   * Whether to show the section title and icon
   */
  showTitle?: boolean;
  /**
   * Callback for error handling
   */
  onError?: (error: string) => void;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
  /**
   * Whether to auto-fetch credits (default: true)
   */
  autoFetchCredits?: boolean;
}

const Pricing: React.FC<PricingProps> = ({
  showTitle = true,
  onError,
  className = '',
  autoFetchCredits = true,
}) => {
  const [canClaimReviewCredits, setCanClaimReviewCredits] =
    React.useState<boolean>(false);
  const [claimingReviewCredits, setClaimingReviewCredits] =
    React.useState<boolean>(false);
  const [showReviewGif, setShowReviewGif] = React.useState<boolean>(false);
  const [reviewInstructionsShown, setReviewInstructionsShown] =
    React.useState<boolean>(false);
  const [purchasingPlan, setPurchasingPlan] = React.useState<
    'essential' | 'pro' | null
  >(null);
  const [openingBillingPortal, setOpeningBillingPortal] =
    React.useState<boolean>(false);

  const {
    credits,
    loading: creditsLoading,
    getCreditsDisplay,
    refreshCredits,
  } = useUserCredits(autoFetchCredits);

  // Check if user has active Pro subscription
  const hasActivePro =
    credits?.subscriptionStatus === 'active' &&
    credits?.subscriptionPlanId === 'PRO';

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

  const handlePurchaseCredits = async (
    plan: 'essential' | 'pro',
    creditsAmount: number
  ) => {
    setPurchasingPlan(plan);
    try {
      const result = await serverFunctions.purchaseCredits(creditsAmount);
      if (result.success && result.checkoutUrl) {
        // Open checkout URL in new tab
        window.open(result.checkoutUrl, '_blank');
      } else {
        onError?.(result.error || 'Failed to create checkout session');
      }
    } catch (err) {
      onError?.(
        err instanceof Error ? err.message : 'Failed to purchase credits'
      );
    } finally {
      setPurchasingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setOpeningBillingPortal(true);
    try {
      const result = await serverFunctions.openBillingPortal();
      if (result.success && result.portalUrl) {
        // Open billing portal in new tab
        window.open(result.portalUrl, '_blank');
      } else {
        onError?.(result.error || 'Failed to open billing portal');
      }
    } catch (err) {
      onError?.(
        err instanceof Error ? err.message : 'Failed to open billing portal'
      );
    } finally {
      setOpeningBillingPortal(false);
    }
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
      } else {
        onError?.(result.message);
      }
    } catch (err) {
      onError?.(
        err instanceof Error ? err.message : 'Failed to claim review credits'
      );
    } finally {
      setClaimingReviewCredits(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-green-500" />
            <h2 className="text-base font-semibold text-gray-800">
              Credits & Billing
            </h2>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Credit Balance Card */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-green-700 uppercase tracking-wide">
                  Current Balance
                </p>
                {hasActivePro && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                    <Star className="w-3 h-3 fill-white" />
                    Pro
                  </span>
                )}
              </div>
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
          </div>
        </div>

        {/* Low Credits Warning */}
        {credits && credits.availableCredits <= 5 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800 flex items-center">
              <span className="mr-2">⚠️</span>
              You're running low on credits! Purchase more to continue using AI
              tools.
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
              Rate our addon in the Google Workspace Marketplace with 5 ⭐ and
              get {DEFAULT_REVIEW_CREDITS} free credits instantly!
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

        {/* Purchase/Manage Section */}
        {hasActivePro ? (
          // Show Manage Subscription button for Pro users
          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              You have an active Pro subscription with {PRO_CREDITS} credits per
              month.
            </p>
            <Button
              onClick={handleManageSubscription}
              disabled={openingBillingPortal}
              className="w-full h-11 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium"
            >
              <Star className="w-4 h-4 mr-2 fill-white" />
              {openingBillingPortal ? 'Opening...' : 'Manage Pro Subscription'}
            </Button>
          </div>
        ) : (
          // Show Plan Cards for non-Pro users
          <div className="space-y-3">
            <p className="text-xs text-gray-600 mb-2">
              Choose a plan to get more credits and unlock AI-powered tools:
            </p>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 gap-3">
              {/* Essential Plan */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white hover:border-green-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      Essential
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Perfect for occasional use
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {ESSENTIAL_PRICE}
                    </div>
                    <div className="text-xs text-gray-500">one-time</div>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                    <span>{ESSENTIAL_CREDITS} credits</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                    <span>Never expires</span>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    handlePurchaseCredits('essential', ESSENTIAL_CREDITS)
                  }
                  disabled={purchasingPlan !== null}
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {purchasingPlan === 'essential' ? (
                    'Processing...'
                  ) : (
                    <>
                      <CreditCard className="w-3 h-3 mr-1" />
                      Get Essential
                    </>
                  )}
                </Button>
              </div>

              {/* Pro Plan */}
              <div className="border-2 border-yellow-400 rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-orange-50 relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-sm">
                    <Zap className="w-3 h-3 fill-white" />
                    Popular
                  </span>
                </div>
                <div className="flex items-start justify-between mb-3 mt-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Pro</h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Best for active creators
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {PRO_PRICE.split('/')[0]}
                    </div>
                    <div className="text-xs text-gray-600">per month</div>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <Check className="w-3 h-3 text-orange-600 flex-shrink-0" />
                    <span className="font-medium">
                      {PRO_CREDITS} credits/month
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <Check className="w-3 h-3 text-orange-600 flex-shrink-0" />
                    <span>Never expires</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <Check className="w-3 h-3 text-orange-600 flex-shrink-0" />
                    <span>All AI tools included</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <Check className="w-3 h-3 text-orange-600 flex-shrink-0" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
                <Button
                  onClick={() => handlePurchaseCredits('pro', PRO_CREDITS)}
                  disabled={purchasingPlan !== null}
                  size="sm"
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium"
                >
                  {purchasingPlan === 'pro' ? (
                    'Processing...'
                  ) : (
                    <>
                      <Star className="w-3 h-3 mr-1 fill-white" />
                      Subscribe to Pro
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
