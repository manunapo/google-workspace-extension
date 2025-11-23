import * as React from 'react';
import { AlertCircle, CreditCard, Star } from 'lucide-react';
import Modal from './ui/modal';
import { Button } from './ui/button';
import { serverFunctions } from '../utils/serverFunctions';
import { ESSENTIAL_CREDITS, PRO_CREDITS } from '../../constants';

interface LowCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
}

const LowCreditsModal: React.FC<LowCreditsModalProps> = ({
  isOpen,
  onClose,
  currentCredits,
}) => {
  const [purchasingPlan, setPurchasingPlan] = React.useState<
    'essential' | 'pro' | null
  >(null);
  const [error, setError] = React.useState<string | null>(null);

  const handlePurchaseCredits = async (
    plan: 'essential' | 'pro',
    creditsAmount: number
  ) => {
    setPurchasingPlan(plan);
    setError(null);
    try {
      const result = await serverFunctions.purchaseCredits(creditsAmount);
      if (result.success && result.checkoutUrl) {
        window.open(result.checkoutUrl, '_blank');
        // Close modal after opening checkout
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setError(result.error || 'Failed to create checkout session');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to purchase credits'
      );
    } finally {
      setPurchasingPlan(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md"
      showCloseButton={false}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12rounded-full flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            You're creating amazing things!
          </h2>
          <p className="text-sm text-gray-600">
            You now have only{' '}
            <span className="font-semibold text-gray-900">
              {currentCredits} {currentCredits === 1 ? 'credit' : 'credits'}
            </span>{' '}
            left. Secure more before you run out.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* CTAs */}
        <div className="space-y-3">
          {/* Subscribe & Save CTA */}
          <Button
            onClick={() => handlePurchaseCredits('pro', PRO_CREDITS)}
            disabled={purchasingPlan !== null}
            className="w-full h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold text-base"
          >
            {purchasingPlan === 'pro' ? (
              'Processing...'
            ) : (
              <>
                <Star className="w-4 h-4 mr-2 fill-white" />
                Subscribe & Save
              </>
            )}
          </Button>

          {/* Buy Credits CTA */}
          <Button
            onClick={() =>
              handlePurchaseCredits('essential', ESSENTIAL_CREDITS)
            }
            disabled={purchasingPlan !== null}
            variant="outline"
            className="w-full h-12 border-2 border-gray-300 hover:bg-gray-50 font-semibold text-base"
          >
            {purchasingPlan === 'essential' ? (
              'Processing...'
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Buy Credits
              </>
            )}
          </Button>
        </div>

        {/* Dismiss Link */}
        <div className="text-center pt-2">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LowCreditsModal;
