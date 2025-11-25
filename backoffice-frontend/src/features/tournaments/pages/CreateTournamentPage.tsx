import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TournamentForm } from '../components/TournamentForm';
import { tournamentApi } from '../../../services/tournamentApi';
import type { TournamentFormData } from '../schemas/tournamentSchema';
import type { CreateTournamentCommand } from '../../../services/api.types';

/**
 * Create tournament page
 */
export const CreateTournamentPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSubmit = async (data: TournamentFormData) => {
    setIsSubmitting(true);
    setError(null);
    setValidationErrors([]);

    try {
      // Map form data to API command
      const command: CreateTournamentCommand = {
        name: data.name,
        description: data.description,
        type: data.type,
        scoringType: data.scoringType,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        prizePool: data.prizePool,
        prizeDistribution: data.prizeDistribution,
        maxParticipants: data.maxParticipants,
        entryFee: data.entryFee,
        // Parse comma-separated game IDs into array
        eligibleGames: data.eligibleGames
          ? data.eligibleGames.split(',').map(g => g.trim()).filter(g => g.length > 0)
          : undefined
      };

      console.log('Sending tournament creation request:', JSON.stringify(command, null, 2));

      const tournament = await tournamentApi.createTournament(command);

      // Navigate to tournament details or list page
      navigate(`/tournaments/${tournament.id}`);
    } catch (err: any) {
      console.error('Failed to create tournament:', err);

      // Check if error has validation errors attached by axios interceptor
      if (err.validationErrors && Array.isArray(err.validationErrors)) {
        setValidationErrors(err.validationErrors);
        setError('Please fix the validation errors below:');
      } else if (err.response?.data) {
        // Fallback: try to extract error details from response
        const data = err.response.data;
        console.log('Error response data:', data);

        if (data.errors && typeof data.errors === 'object') {
          const errors: string[] = [];
          for (const [field, messages] of Object.entries(data.errors)) {
            if (Array.isArray(messages)) {
              messages.forEach((msg: string) => errors.push(`${field}: ${msg}`));
            }
          }
          setValidationErrors(errors);
          setError('Validation failed:');
        } else if (data.detail) {
          setError(data.detail);
        } else if (data.title) {
          setError(data.title);
        } else {
          setError(JSON.stringify(data, null, 2));
        }
      } else {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to create tournament. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/tournaments');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Create New Tournament
          </h1>
          <p className="text-secondary-600">
            Set up a new tournament with prize pools and leaderboard tracking
          </p>
        </div>

        {/* Error Alert */}
        {(error || validationErrors.length > 0) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
                {validationErrors.length > 0 && (
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                    {validationErrors.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tournament Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <TournamentForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            submitButtonText="Create Tournament"
          />
        </div>
    </div>
  );
};
