import { Link } from 'react-router-dom';
import type { LevelSystem } from '../../../services/api.types';
import { LevelSystemStatus } from '../../../services/api.types';

interface LevelSystemListProps {
  levelSystems: LevelSystem[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  onPause: (id: string) => void;
}

/**
 * List component for displaying level systems
 */
export function LevelSystemList({
  levelSystems,
  isLoading,
  onDelete,
  onActivate,
  onPause
}: LevelSystemListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (levelSystems.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-secondary-200 p-12 text-center">
        <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">No Level Systems Yet</h3>
        <p className="text-secondary-600 mb-6">
          Create your first level system to start tracking player progression.
        </p>
        <Link
          to="/levels/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Level System
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {levelSystems.map(levelSystem => (
        <LevelSystemCard
          key={levelSystem.id}
          levelSystem={levelSystem}
          onDelete={onDelete}
          onActivate={onActivate}
          onPause={onPause}
        />
      ))}
    </div>
  );
}

interface LevelSystemCardProps {
  levelSystem: LevelSystem;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  onPause: (id: string) => void;
}

function LevelSystemCard({ levelSystem, onDelete, onActivate, onPause }: LevelSystemCardProps) {
  const statusColors = {
    [LevelSystemStatus.DRAFT]: 'bg-secondary-100 text-secondary-700',
    [LevelSystemStatus.ACTIVE]: 'bg-green-100 text-green-700',
    [LevelSystemStatus.PAUSED]: 'bg-yellow-100 text-yellow-700',
    [LevelSystemStatus.ARCHIVED]: 'bg-red-100 text-red-700'
  };

  const canActivate = levelSystem.status === LevelSystemStatus.DRAFT || levelSystem.status === LevelSystemStatus.PAUSED;
  const canPause = levelSystem.status === LevelSystemStatus.ACTIVE;
  const canDelete = levelSystem.status !== LevelSystemStatus.ACTIVE;

  return (
    <div className="bg-white rounded-xl border border-secondary-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link
                to={`/levels/${levelSystem.id}`}
                className="text-xl font-semibold text-secondary-900 hover:text-primary-600"
              >
                {levelSystem.name}
              </Link>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[levelSystem.status]}`}>
                {levelSystem.status}
              </span>
            </div>
            {levelSystem.description && (
              <p className="text-secondary-600 text-sm mb-4">{levelSystem.description}</p>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-secondary-600">
                  <span className="font-medium text-secondary-900">{levelSystem.maxLevel}</span> levels
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-secondary-600">
                  <span className="font-medium text-secondary-900">{levelSystem.tiers.length}</span> tiers
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-secondary-600">
                  <span className="font-medium text-secondary-900">{levelSystem.xpRules.length}</span> XP rules
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <span className="text-secondary-600">
                  <span className="font-medium text-secondary-900">{levelSystem.levelRewards.length}</span> rewards
                </span>
              </div>
            </div>

            {/* Tiers Preview */}
            {levelSystem.tiers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {levelSystem.tiers.map(tier => (
                  <span
                    key={tier.id}
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: tier.color ? `${tier.color}20` : '#e5e7eb',
                      color: tier.color || '#374151'
                    }}
                  >
                    {tier.name} ({tier.fromLevel}-{tier.toLevel})
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            {canActivate && (
              <button
                onClick={() => onActivate(levelSystem.id)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                title="Activate"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
            {canPause && (
              <button
                onClick={() => onPause(levelSystem.id)}
                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                title="Pause"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
            <Link
              to={`/levels/${levelSystem.id}/edit`}
              className="p-2 text-secondary-600 hover:bg-secondary-50 rounded-lg"
              title="Edit"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
            {canDelete && (
              <button
                onClick={() => onDelete(levelSystem.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                title="Delete"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer with timestamps */}
      <div className="px-6 py-3 bg-secondary-50 border-t border-secondary-200 rounded-b-xl">
        <div className="flex justify-between text-xs text-secondary-500">
          <span>Created: {new Date(levelSystem.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(levelSystem.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
