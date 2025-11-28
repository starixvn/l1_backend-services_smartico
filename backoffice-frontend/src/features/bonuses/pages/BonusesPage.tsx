import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BonusList } from '../components/BonusList';
import { bonusApi } from '../../../services/bonusApi';
import type { Bonus } from '../../../services/api.types';

/**
 * Bonuses listing page
 */
export const BonusesPage: React.FC = () => {
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBonuses();
  }, []);

  const loadBonuses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bonusApi.getAllBonuses();
      setBonuses(data);
    } catch (err) {
      console.error('Failed to load bonuses:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load bonuses. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bonus?')) {
      return;
    }

    try {
      await bonusApi.deleteBonus(id);
      setBonuses(bonuses.filter(b => b.id !== id));
    } catch (err) {
      console.error('Failed to delete bonus:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete bonus. Please try again.'
      );
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const updated = await bonusApi.activateBonus(id);
      setBonuses(bonuses.map(b => b.id === id ? updated : b));
    } catch (err) {
      console.error('Failed to activate bonus:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to activate bonus. Please try again.'
      );
    }
  };

  const handlePause = async (id: string) => {
    try {
      const updated = await bonusApi.pauseBonus(id);
      setBonuses(bonuses.map(b => b.id === id ? updated : b));
    } catch (err) {
      console.error('Failed to pause bonus:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to pause bonus. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">Bonuses</h1>
            <p className="text-secondary-600">
              Manage and monitor your bonus campaigns
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/bonuses/limits"
              className="px-4 py-3 text-secondary-700 border border-secondary-300 rounded-lg hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium flex items-center gap-2"
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Global Limits
            </Link>
            <Link
              to="/bonuses/create"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium flex items-center gap-2"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Bonus
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
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
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <button
                  onClick={loadBonuses}
                  className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bonus List */}
        <BonusList
          bonuses={bonuses}
          isLoading={isLoading}
          onDelete={handleDelete}
          onActivate={handleActivate}
          onPause={handlePause}
        />
      </div>
    </div>
  );
};
