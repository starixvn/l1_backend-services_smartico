import { useState, useEffect } from 'react';
import type { Tournament } from '../types/tournament';
import { TournamentStatus } from '../types/tournament';
import { TournamentCard } from './TournamentCard';
import { TournamentLeaderboard } from './TournamentLeaderboard';
import { TournamentService } from '../services/tournamentService';

interface TournamentListProps {
  userId: string;
}

export function TournamentList({ userId }: TournamentListProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registeringId, setRegisteringId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'finished'>('all');
  const [selectedLeaderboardId, setSelectedLeaderboardId] = useState<number | null>(null);

  useEffect(() => {
    loadTournaments();
  }, [userId]);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TournamentService.getTournaments(userId);
      setTournaments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (tournamentId: number) => {
    try {
      setRegisteringId(tournamentId);
      const result = await TournamentService.registerTournament(tournamentId, userId);

      if (result.success && result.updatedTournament) {
        // Update tournament in state
        setTournaments((prev) =>
          prev.map((t) => (t.instanceId === tournamentId ? result.updatedTournament! : t))
        );
        alert(`✅ Successfully registered for tournament!`);
      } else {
        alert(`❌ ${result.errorMessage || 'Failed to register'}`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to register for tournament');
    } finally {
      setRegisteringId(null);
    }
  };

  const filteredTournaments = tournaments.filter((tournament) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming')
      return tournament.status === TournamentStatus.Published || tournament.status === TournamentStatus.Register;
    if (filter === 'active') return tournament.status === TournamentStatus.Started;
    if (filter === 'finished')
      return (
        tournament.status === TournamentStatus.Finished ||
        tournament.status === TournamentStatus.Cancelled ||
        tournament.status === TournamentStatus.Finalizing
      );
    return true;
  });

  const stats = {
    total: tournaments.length,
    active: tournaments.filter((t) => t.status === TournamentStatus.Started).length,
    registered: tournaments.filter((t) => t.isUserRegistered).length,
    upcoming: tournaments.filter(
      (t) => t.status === TournamentStatus.Published || t.status === TournamentStatus.Register
    ).length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Error loading tournaments</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={loadTournaments}
          className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const selectedTournament = selectedLeaderboardId
    ? tournaments.find((t) => t.instanceId === selectedLeaderboardId)
    : null;

  return (
    <div>
      {/* Leaderboard Modal */}
      {selectedLeaderboardId && selectedTournament && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <TournamentLeaderboard
              userId={userId}
              tournamentInstanceId={selectedLeaderboardId}
              tournamentName={selectedTournament.name}
              onClose={() => setSelectedLeaderboardId(null)}
            />
          </div>
        </div>
      )}

      {/* Header & Stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Tournaments</h2>
          <button
            onClick={loadTournaments}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Total Tournaments</p>
            <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-medium">Active Now</p>
            <p className="text-3xl font-bold text-green-900">{stats.active}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-600 font-medium">My Registrations</p>
            <p className="text-3xl font-bold text-purple-900">{stats.registered}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-600 font-medium">Upcoming</p>
            <p className="text-3xl font-bold text-orange-900">{stats.upcoming}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📅 Upcoming ({stats.upcoming})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎮 Active ({stats.active})
          </button>
          <button
            onClick={() => setFilter('finished')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'finished' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✓ Finished ({tournaments.filter((t) => t.isFinished).length})
          </button>
        </div>
      </div>

      {/* Tournaments Grid */}
      {filteredTournaments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 text-lg">No tournaments found</p>
          <p className="text-gray-500 text-sm mt-1">
            {filter !== 'all' ? 'Try changing the filter' : 'Check back later for new tournaments!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.instanceId}
              tournament={tournament}
              onRegister={handleRegister}
              onViewLeaderboard={(id) => setSelectedLeaderboardId(id)}
              isLoading={registeringId === tournament.instanceId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
