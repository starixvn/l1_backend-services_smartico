import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { TournamentDetails } from '../components/TournamentDetails';
import { tournamentApi } from '../../../services/tournamentApi';
import type { Tournament } from '../../../services/api.types';

/**
 * Tournament details page
 */
export const TournamentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadTournament(id);
    }
  }, [id]);

  const loadTournament = async (tournamentId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await tournamentApi.getTournamentById(tournamentId);
      setTournament(data);
    } catch (err) {
      console.error('Failed to load tournament:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load tournament. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/tournaments/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!id || !tournament) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${tournament.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await tournamentApi.deleteTournament(id);
      navigate('/tournaments');
    } catch (err) {
      console.error('Failed to delete tournament:', err);
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to delete tournament. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
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
          <p className="text-secondary-600">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
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
                  Error loading tournament
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  {error || 'Tournament not found'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => id && loadTournament(id)}
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
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
            <li className="text-secondary-600">{tournament.name}</li>
          </ol>
        </nav>

        {/* Tournament Details */}
        <TournamentDetails
          tournament={tournament}
          onEdit={handleEdit}
          onDelete={isDeleting ? undefined : handleDelete}
        />

        {/* Leaderboard Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-secondary-900">Leaderboard</h2>
            <Link
              to={`/tournaments/${id}/leaderboard`}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
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
              View Full Leaderboard
            </Link>
          </div>
          <div className="text-center py-8 text-secondary-600">
            <p>Click the button above to view the tournament leaderboard with live rankings</p>
          </div>
        </div>
      </div>
    </div>
  );
};
