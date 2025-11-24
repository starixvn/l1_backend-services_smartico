import React from 'react';
import type { LeaderboardEntry } from '../../../services/api.types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
  highlightPlayerId?: string;
}

/**
 * Leaderboard table component displaying player rankings
 */
export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  isLoading = false,
  highlightPlayerId
}) => {
  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400 text-yellow-900';
    if (rank === 2) return 'bg-gray-300 text-gray-900';
    if (rank === 3) return 'bg-amber-600 text-white';
    return 'bg-primary-100 text-primary-700';
  };

  const formatScore = (score: number) => {
    return score.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4"
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

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 text-secondary-300 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-secondary-900 mb-2">No leaderboard data</h3>
        <p className="text-secondary-600">The leaderboard is currently empty</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-secondary-200">
            <th className="text-left py-4 px-4 text-sm font-semibold text-secondary-700">
              Rank
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-secondary-700">
              Player
            </th>
            <th className="text-right py-4 px-4 text-sm font-semibold text-secondary-700">
              Score
            </th>
            <th className="text-right py-4 px-4 text-sm font-semibold text-secondary-700">
              Last Updated
            </th>
            <th className="text-right py-4 px-4 text-sm font-semibold text-secondary-700">
              Stats
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isHighlighted = highlightPlayerId === entry.playerId;
            return (
              <tr
                key={entry.id}
                className={`
                  border-b border-secondary-100 hover:bg-secondary-50 transition-colors
                  ${isHighlighted ? 'bg-primary-50 hover:bg-primary-100' : ''}
                `}
              >
                {/* Rank */}
                <td className="py-4 px-4">
                  <span
                    className={`
                      inline-flex items-center justify-center w-10 h-10 rounded-full
                      font-bold text-sm
                      ${getRankBadgeColor(entry.rank)}
                    `}
                  >
                    {entry.rank}
                  </span>
                </td>

                {/* Player */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt={entry.playerName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary-200 flex items-center justify-center">
                        <span className="text-secondary-600 font-medium text-sm">
                          {entry.playerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-secondary-900">{entry.playerName}</p>
                      <p className="text-xs text-secondary-500">ID: {entry.playerId}</p>
                    </div>
                  </div>
                </td>

                {/* Score */}
                <td className="py-4 px-4 text-right">
                  <span className="text-lg font-bold text-secondary-900">
                    {formatScore(entry.score)}
                  </span>
                </td>

                {/* Last Updated */}
                <td className="py-4 px-4 text-right">
                  <span className="text-sm text-secondary-600">
                    {formatLastUpdated(entry.lastUpdated)}
                  </span>
                </td>

                {/* Stats */}
                <td className="py-4 px-4 text-right">
                  {entry.metadata && (
                    <div className="flex flex-col items-end gap-1 text-xs text-secondary-600">
                      {entry.metadata.gamesPlayed && (
                        <span>Games: {entry.metadata.gamesPlayed}</span>
                      )}
                      {entry.metadata.wins && (
                        <span>Wins: {entry.metadata.wins}</span>
                      )}
                      {entry.metadata.level && (
                        <span>Level: {entry.metadata.level}</span>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
