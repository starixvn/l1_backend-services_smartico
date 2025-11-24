import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { LeaderboardFilters } from '../components/LeaderboardFilters';
import { leaderboardApi } from '../../../services/leaderboardApi';
import { tournamentApi } from '../../../services/tournamentApi';
import type { LeaderboardEntry, Tournament } from '../../../services/api.types';

/**
 * Leaderboard page showing tournament rankings
 */
export const LeaderboardPage: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [limit, setLimit] = useState(100);

  useEffect(() => {
    if (tournamentId) {
      loadData(tournamentId);
    }
  }, [tournamentId, limit]);

  const loadData = async (tid: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Load tournament and leaderboard in parallel
      const [tournamentData, leaderboardData] = await Promise.all([
        tournamentApi.getTournamentById(tid),
        leaderboardApi.getLeaderboard(tid, limit)
      ]);

      setTournament(tournamentData);
      setEntries(leaderboardData);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load leaderboard. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!tournamentId) return;

    try {
      setIsRefreshing(true);
      const leaderboardData = await leaderboardApi.getLeaderboard(tournamentId, limit);
      setEntries(leaderboardData);
    } catch (err) {
      console.error('Failed to refresh leaderboard:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGenerateMockData = async () => {
    if (!tournamentId) return;

    const confirmed = window.confirm(
      'Generate mock leaderboard data for this tournament? This will create 50 fake player entries.'
    );

    if (!confirmed) return;

    try {
      setIsLoading(true);
      await leaderboardApi.generateMockLeaderboard(tournamentId, 50);
      await handleRefresh();
    } catch (err) {
      console.error('Failed to generate mock data:', err);
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to generate mock data. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Filter entries based on search query
  const filteredEntries = useMemo(() => {
    if (!searchQuery) return entries;

    const query = searchQuery.toLowerCase();
    return entries.filter(
      (entry) =>
        entry.playerName.toLowerCase().includes(query) ||
        entry.playerId.toLowerCase().includes(query)
    );
  }, [entries, searchQuery]);

  if (isLoading && !tournament) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-secondary-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-grow">
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  Error loading leaderboard
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  {error || 'Tournament not found'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => tournamentId && loadData(tournamentId)}
                    className="px-4 py-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
                  >
                    Try again
                  </button>
                  <Link
                    to="/tournaments"
                    className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 underline"
                  >
                    Back to tournaments
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link
                to="/tournaments"
                className="text-primary-600 hover:text-primary-700 hover:underline"
              >
                Tournaments
              </Link>
            </li>
            <li className="text-secondary-400">/</li>
            <li>
              <Link
                to={`/tournaments/${tournamentId}`}
                className="text-primary-600 hover:text-primary-700 hover:underline"
              >
                {tournament.name}
              </Link>
            </li>
            <li className="text-secondary-400">/</li>
            <li className="text-secondary-600">Leaderboard</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">Leaderboard</h1>
            <p className="text-secondary-600">{tournament.name}</p>
          </div>
          {entries.length === 0 && (
            <button
              onClick={handleGenerateMockData}
              disabled={isLoading}
              className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 disabled:opacity-50"
            >
              Generate Mock Data
            </button>
          )}
        </div>

        {/* Leaderboard Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <LeaderboardFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            limit={limit}
            onLimitChange={setLimit}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />

          <LeaderboardTable
            entries={filteredEntries}
            isLoading={isLoading}
          />

          {/* Results count */}
          {!isLoading && entries.length > 0 && (
            <div className="mt-4 text-sm text-secondary-600 text-center">
              Showing {filteredEntries.length} of {entries.length} entries
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
