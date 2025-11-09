import { useState } from 'react';
import { useJackpots } from '../hooks/useJackpots';
import { useJackpotWinners } from '../hooks/useJackpotWinners';
import { JackpotList } from '../components/JackpotList';
import { WinnerList } from '../components/WinnerList';
import { JackpotType } from '../types/jackpot';

type TabType = 'jackpots' | 'winners';

interface JackpotsPageProps {
  userId: string;
}

/**
 * Main Jackpots page with tabbed navigation between Jackpots and Winners.
 */
export function JackpotsPage({ userId }: JackpotsPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('jackpots');
  const [winnerFilterType, setWinnerFilterType] = useState<JackpotType | undefined>(undefined);

  // Fetch jackpots with real-time updates
  const { jackpots, loading: jackpotsLoading, error: jackpotsError, refetch: refetchJackpots } = useJackpots(userId);

  // Fetch winners with filtering
  const { winners, loading: winnersLoading, error: winnersError } = useJackpotWinners(userId, winnerFilterType);

  const handleWinnerFilterChange = (filterType?: JackpotType) => {
    setWinnerFilterType(filterType);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Jackpots</h1>
        <p className="text-gray-600">Opt in to jackpots and compete for massive prize pools!</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('jackpots')}
            className={`pb-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
              activeTab === 'jackpots'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active Jackpots
            {!jackpotsLoading && (
              <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {jackpots.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('winners')}
            className={`pb-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
              activeTab === 'winners'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recent Winners
            {!winnersLoading && activeTab === 'winners' && (
              <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {winners.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'jackpots' && (
        <div>
          <JackpotList
            jackpots={jackpots}
            loading={jackpotsLoading}
            error={jackpotsError}
            userId={userId}
            onRefresh={refetchJackpots}
          />
        </div>
      )}

      {activeTab === 'winners' && (
        <div>
          {/* Winner Type Filter */}
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => handleWinnerFilterChange(undefined)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                winnerFilterType === undefined
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Winners
            </button>
            <button
              onClick={() => handleWinnerFilterChange(JackpotType.MultiUser)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                winnerFilterType === JackpotType.MultiUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              MultiUser
            </button>
            <button
              onClick={() => handleWinnerFilterChange(JackpotType.Personal)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                winnerFilterType === JackpotType.Personal
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Personal
            </button>
          </div>

          <WinnerList
            winners={winners}
            loading={winnersLoading}
            error={winnersError}
            filterType={winnerFilterType}
            onFilterChange={handleWinnerFilterChange}
          />
        </div>
      )}
    </div>
  );
}
