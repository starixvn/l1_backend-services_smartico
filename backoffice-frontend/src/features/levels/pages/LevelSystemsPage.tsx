import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LevelSystemList } from '../components/LevelSystemList';
import { levelSystemApi } from '../../../services/levelSystemApi';
import type { LevelSystem } from '../../../services/api.types';

/**
 * Level Systems listing page
 */
export function LevelSystemsPage() {
  const [levelSystems, setLevelSystems] = useState<LevelSystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLevelSystems();
  }, []);

  const loadLevelSystems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await levelSystemApi.getAllLevelSystems();
      setLevelSystems(data);
    } catch (err) {
      console.error('Failed to load level systems:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load level systems. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this level system?')) {
      return;
    }

    try {
      await levelSystemApi.deleteLevelSystem(id);
      setLevelSystems(levelSystems.filter(ls => ls.id !== id));
    } catch (err: any) {
      console.error('Failed to delete level system:', err);
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Failed to delete level system. Please try again.'
      );
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const updated = await levelSystemApi.activateLevelSystem(id);
      // Update the activated one and pause any previously active
      setLevelSystems(levelSystems.map(ls => {
        if (ls.id === id) return updated;
        if (ls.status === 'Active') return { ...ls, status: 'Paused' as const };
        return ls;
      }));
    } catch (err: any) {
      console.error('Failed to activate level system:', err);
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Failed to activate level system. Please try again.'
      );
    }
  };

  const handlePause = async (id: string) => {
    try {
      const updated = await levelSystemApi.pauseLevelSystem(id);
      setLevelSystems(levelSystems.map(ls => ls.id === id ? updated : ls));
    } catch (err: any) {
      console.error('Failed to pause level system:', err);
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Failed to pause level system. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">Level Systems</h1>
            <p className="text-secondary-600">
              Configure player progression systems with XP rules, tiers, and rewards
            </p>
          </div>
          <Link
            to="/levels/create"
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
            Create Level System
          </Link>
        </div>

        {/* Info Banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-800">Only one level system can be active</h3>
              <p className="mt-1 text-sm text-blue-700">
                When you activate a level system, any previously active system will be automatically paused.
                Players will continue earning XP under the newly active system.
              </p>
            </div>
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
                  onClick={loadLevelSystems}
                  className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Level System List */}
        <LevelSystemList
          levelSystems={levelSystems}
          isLoading={isLoading}
          onDelete={handleDelete}
          onActivate={handleActivate}
          onPause={handlePause}
        />
      </div>
    </div>
  );
}
