import React from 'react';
import type { Jackpot } from '../../../services/api.types';
import { JackpotCard } from './JackpotCard';

interface JackpotListProps {
  jackpots: Jackpot[];
  isLoading?: boolean;
}

/**
 * Jackpot list component for displaying multiple jackpot cards
 */
export const JackpotList: React.FC<JackpotListProps> = ({ jackpots, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="border border-secondary-200 rounded-lg p-6 animate-pulse"
          >
            <div className="h-6 bg-secondary-200 rounded w-3/4 mb-4" />
            <div className="h-16 bg-secondary-100 rounded mb-4" />
            <div className="space-y-2 mb-4">
              <div className="h-10 bg-secondary-100 rounded" />
              <div className="h-10 bg-secondary-100 rounded" />
            </div>
            <div className="h-4 bg-secondary-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (jackpots.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-secondary-200">
        <div className="text-6xl mb-4">💰</div>
        <h3 className="text-lg font-medium text-secondary-900 mb-2">
          No jackpots found
        </h3>
        <p className="text-secondary-500">
          Create your first jackpot to start engaging your players!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jackpots.map((jackpot) => (
        <JackpotCard key={jackpot.id} jackpot={jackpot} />
      ))}
    </div>
  );
};
