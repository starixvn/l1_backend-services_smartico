import { useState, useEffect } from 'react';
import type { TournamentParticipant } from '../types/tournament';
import { TournamentService } from '../services/tournamentService';

interface TournamentLeaderboardProps {
  userId: string;
  tournamentInstanceId: number;
  tournamentName: string;
  onClose?: () => void;
}

export function TournamentLeaderboard({
  userId,
  tournamentInstanceId,
  tournamentName,
  onClose,
}: TournamentLeaderboardProps) {
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [userId, tournamentInstanceId]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TournamentService.getLeaderboard(userId, tournamentInstanceId);
      setParticipants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (position: number): string | null => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return null;
  };

  const getPositionColor = (position: number): string => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-400';
    if (position === 2) return 'bg-gradient-to-r from-gray-200 to-gray-100 border-gray-400';
    if (position === 3) return 'bg-gradient-to-r from-orange-100 to-orange-50 border-orange-400';
    return 'bg-white border-gray-200';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Leaderboard - {tournamentName}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          )}
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Leaderboard - {tournamentName}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          )}
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error loading leaderboard</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={loadLeaderboard}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🏆 Leaderboard</h2>
          <p className="text-sm text-gray-600">{tournamentName}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadLeaderboard}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            🔄 Refresh
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Participants */}
      {participants.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600">No participants yet</p>
          <p className="text-gray-500 text-sm mt-1">Be the first to join!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {participants.map((participant, index) => {
            const medal = getMedalIcon(participant.position);
            const positionColor = getPositionColor(participant.position);
            const isCurrentUser = participant.userId === userId;

            return (
              <div
                key={`${participant.userId}-${participant.position}`}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${positionColor} ${
                  isCurrentUser ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Position */}
                  <div className="flex items-center justify-center w-12 h-12">
                    {medal ? (
                      <span className="text-3xl">{medal}</span>
                    ) : (
                      <span className="text-xl font-bold text-gray-600">#{participant.position}</span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {participant.publicUsername || participant.userId || 'Anonymous'}
                      </p>
                      {isCurrentUser && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    {participant.userId && (
                      <p className="text-sm text-gray-600">User ID: {participant.userId}</p>
                    )}
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{participant.score.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          {participants.length > 50
            ? 'Showing top 50 players + your position'
            : `Showing ${participants.length} participant${participants.length !== 1 ? 's' : ''}`}
        </p>
      </div>
    </div>
  );
}
