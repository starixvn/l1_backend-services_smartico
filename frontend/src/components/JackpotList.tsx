import { useState, useEffect } from 'react';
import { JackpotDetails, JackpotType } from '../types/jackpot';
import { JackpotCard } from './JackpotCard';
import { JackpotService } from '../services/jackpotService';

interface JackpotListProps {
  jackpots: JackpotDetails[];
  loading: boolean;
  error: string | null;
  userId: string;
  onRefresh: () => void;
}

/**
 * Displays a grid of jackpot cards with filtering and actions.
 */
export function JackpotList({ jackpots, loading, error, userId, onRefresh }: JackpotListProps) {
  const [filter, setFilter] = useState<JackpotType | 'all'>('all');
  const [localJackpots, setLocalJackpots] = useState<JackpotDetails[]>(jackpots);

  // Update local jackpots when props change
  useEffect(() => {
    setLocalJackpots(jackpots);
  }, [jackpots]);

  const handleOptIn = async (templateId: number) => {
    try {
      const response = await JackpotService.optIn(userId, templateId);

      // Update local state optimistically
      setLocalJackpots(prevJackpots =>
        prevJackpots.map(j =>
          j.jpTemplateId === templateId
            ? {
                ...j,
                isOptedIn: true,
                registrationCount: j.jpTypeId === JackpotType.MultiUser ? j.registrationCount + 1 : j.registrationCount
              }
            : j
        )
      );

      // Show success message
      alert(response.message);

      // Refresh data from server
      onRefresh();
    } catch (error) {
      console.error('Opt-in error:', error);
      alert(error instanceof Error ? error.message : 'Failed to opt-in');
      // Revert optimistic update
      setLocalJackpots(jackpots);
    }
  };

  const handleOptOut = async (templateId: number) => {
    try {
      const response = await JackpotService.optOut(userId, templateId);

      // Update local state optimistically
      setLocalJackpots(prevJackpots =>
        prevJackpots.map(j =>
          j.jpTemplateId === templateId
            ? {
                ...j,
                isOptedIn: false,
                registrationCount: j.jpTypeId === JackpotType.MultiUser ? Math.max(0, j.registrationCount - 1) : j.registrationCount
              }
            : j
        )
      );

      // Show success message
      alert(response.message);

      // Refresh data from server
      onRefresh();
    } catch (error) {
      console.error('Opt-out error:', error);
      alert(error instanceof Error ? error.message : 'Failed to opt-out');
      // Revert optimistic update
      setLocalJackpots(jackpots);
    }
  };

  const filteredJackpots = filter === 'all'
    ? localJackpots
    : localJackpots.filter(j => j.jpTypeId === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <div className="text-gray-600">Loading jackpots...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-lg font-semibold mb-2">Failed to load jackpots</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (jackpots.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">🎰</div>
          <div className="text-gray-600 text-lg">No jackpots available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({localJackpots.length})
        </button>
        <button
          onClick={() => setFilter(JackpotType.MultiUser)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === JackpotType.MultiUser
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          👥 MultiUser ({localJackpots.filter(j => j.jpTypeId === JackpotType.MultiUser).length})
        </button>
        <button
          onClick={() => setFilter(JackpotType.Personal)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === JackpotType.Personal
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          👤 Personal ({localJackpots.filter(j => j.jpTypeId === JackpotType.Personal).length})
        </button>
      </div>

      {/* Jackpot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJackpots.map(jackpot => (
          <JackpotCard
            key={jackpot.jpTemplateId}
            jackpot={jackpot}
            onOptIn={handleOptIn}
            onOptOut={handleOptOut}
          />
        ))}
      </div>

      {filteredJackpots.length === 0 && (
        <div className="text-center text-gray-600 py-12">
          No jackpots found for this filter
        </div>
      )}
    </div>
  );
}
