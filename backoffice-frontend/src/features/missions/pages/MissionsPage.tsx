import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { missionApi } from '../../../services/missionApi';
import type { Mission } from '../../../services/api.types';

/**
 * Missions list page - displays all missions for the operator
 */
export const MissionsPage: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await missionApi.getAllMissions();
      setMissions(data);
    } catch (err) {
      setError('Failed to load missions');
      console.error('Error loading missions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-secondary-600">Loading missions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Missions</h1>
          <p className="text-secondary-600 mt-1">
            Manage mission campaigns with visual rule builder
          </p>
        </div>
        <Link
          to="/missions/create"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Create Mission
        </Link>
      </div>

      {/* Missions List */}
      {missions.length === 0 ? (
        <div className="bg-white rounded-lg border border-secondary-200 p-12 text-center">
          <svg
            className="w-16 h-16 text-secondary-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No missions yet
          </h3>
          <p className="text-secondary-600 mb-4">
            Get started by creating your first mission campaign
          </p>
          <Link
            to="/missions/create"
            className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Create First Mission
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className="bg-white rounded-lg border border-secondary-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-secondary-900">
                      {mission.name}
                    </h3>
                    <span
                      className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${
                          mission.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : mission.status === 'Draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : mission.status === 'Completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-secondary-100 text-secondary-800'
                        }
                      `}
                    >
                      {mission.status}
                    </span>
                  </div>
                  {mission.description && (
                    <p className="text-secondary-600 mt-1">
                      {mission.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-secondary-500">
                    <span>
                      Target: {mission.targetSegment === 'AllPlayers' ? 'All Players' : 'VIP Only'}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(mission.startDate).toLocaleDateString()} -{' '}
                      {new Date(mission.endDate).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>
                      {mission.rule.nodes.length} nodes
                    </span>
                  </div>
                </div>
                <Link
                  to={`/missions/${mission.id}`}
                  className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg text-sm font-medium transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
