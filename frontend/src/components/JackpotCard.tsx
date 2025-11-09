import { useState } from 'react';
import { JackpotDetails, JackpotContributionType, JackpotType } from '../types/jackpot';
import { TemperatureIndicator } from './TemperatureIndicator';

interface JackpotCardProps {
  jackpot: JackpotDetails;
  onOptIn: (templateId: number) => Promise<void>;
  onOptOut: (templateId: number) => Promise<void>;
}

/**
 * Displays a single jackpot card with all details and opt-in/out actions.
 */
export function JackpotCard({ jackpot, onOptIn, onOptOut }: JackpotCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleOptIn = async () => {
    try {
      setIsLoading(true);
      await onOptIn(jackpot.jpTemplateId);
    } catch (error) {
      console.error('Opt-in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptOut = async () => {
    if (!window.confirm(`Are you sure you want to opt out of ${jackpot.jpPublicMeta.name}? You'll stop contributing to this jackpot.`)) {
      return;
    }

    try {
      setIsLoading(true);
      await onOptOut(jackpot.jpTemplateId);
    } catch (error) {
      console.error('Opt-out failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const getContributionText = () => {
    if (jackpot.contributionType === JackpotContributionType.Fixed) {
      return `💰 ${jackpot.contributionValue} ${jackpot.jpCurrency} per bet`;
    }
    return `📊 ${jackpot.contributionValue}% of each bet`;
  };

  const getJackpotTypeBadge = () => {
    if (jackpot.jpTypeId === JackpotType.MultiUser) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          👥 MultiUser
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        👤 Personal
      </span>
    );
  };

  return (
    <article
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
      aria-label={`Jackpot: ${jackpot.jpPublicMeta.name}`}
    >
      {/* Header with image */}
      <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 relative">
        <div className="absolute top-3 left-3">
          {getJackpotTypeBadge()}
        </div>
        <div className="absolute top-3 right-3">
          <TemperatureIndicator temperature={jackpot.pot.currentPotTemperature} />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title and Description */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {jackpot.jpPublicMeta.name}
          </h3>
          <p className="text-sm text-gray-600">
            {jackpot.jpPublicMeta.description}
          </p>
        </div>

        {/* Pool Amount */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Current Pool</div>
          <div className="text-3xl font-bold text-purple-600">
            {formatCurrency(jackpot.pot.currentPotAmount, jackpot.jpCurrency)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ≈ {formatCurrency(jackpot.pot.currentPotAmountUserCurrency, jackpot.userCurrency)}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Contribution</div>
            <div className="font-medium text-gray-900">{getContributionText()}</div>
          </div>
          <div>
            <div className="text-gray-600">Participants</div>
            <div className="font-medium text-gray-900">
              {jackpot.registrationCount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          {jackpot.isOptedIn ? (
            <button
              onClick={handleOptOut}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={`Opt out from ${jackpot.jpPublicMeta.name}`}
            >
              {isLoading ? 'Processing...' : 'Opt Out'}
            </button>
          ) : (
            <button
              onClick={handleOptIn}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={`Opt in to ${jackpot.jpPublicMeta.name}`}
            >
              {isLoading ? 'Processing...' : 'Opt In'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
