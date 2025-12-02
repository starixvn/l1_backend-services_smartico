/**
 * MissionAvailabilityCard Component
 * T051-T053: Card showing tier-gated missions with grouping.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getTierColors } from '../../utils/tierColors';
import { MissionTierRow } from './MissionTierRow';
import type { TierMission } from '../../types/velocity';

/**
 * Props for MissionAvailabilityCard component.
 */
export interface MissionAvailabilityCardProps {
  /** List of tier-gated missions */
  missions: TierMission[];
  /** Player's current tier number */
  playerTier: number;
  /** Callback when a mission is clicked */
  onMissionClick?: (mission: TierMission) => void;
  /** Whether to show locked missions */
  showLocked?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Filter options for mission display.
 */
type MissionFilter = 'all' | 'available' | 'completed' | 'locked';

/**
 * MissionAvailabilityCard component.
 * Displays missions grouped by tier with availability status.
 *
 * @param props - Component props
 * @returns Mission availability card element
 *
 * @example
 * ```tsx
 * <MissionAvailabilityCard
 *   missions={tierMissions}
 *   playerTier={2}
 *   onMissionClick={handleMissionSelect}
 * />
 * ```
 */
export function MissionAvailabilityCard({
  missions,
  playerTier,
  onMissionClick,
  showLocked = true,
  className = '',
}: MissionAvailabilityCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [filter, setFilter] = useState<MissionFilter>('all');
  const colors = getTierColors(playerTier);

  // Calculate mission statistics
  const stats = useMemo(() => {
    const available = missions.filter(m => m.isAvailable && !m.isCompleted).length;
    const completed = missions.filter(m => m.isCompleted).length;
    const locked = missions.filter(m => !m.isAvailable).length;
    const total = missions.length;

    return { available, completed, locked, total };
  }, [missions]);

  // Group and filter missions
  const filteredMissions = useMemo(() => {
    let filtered = missions;

    switch (filter) {
      case 'available':
        filtered = missions.filter(m => m.isAvailable && !m.isCompleted);
        break;
      case 'completed':
        filtered = missions.filter(m => m.isCompleted);
        break;
      case 'locked':
        filtered = missions.filter(m => !m.isAvailable);
        break;
    }

    if (!showLocked && filter === 'all') {
      filtered = filtered.filter(m => m.isAvailable);
    }

    // Sort by tier, then by completion status
    return filtered.sort((a, b) => {
      if (a.requiredTier !== b.requiredTier) return a.requiredTier - b.requiredTier;
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return 0;
    });
  }, [missions, filter, showLocked]);

  // Group missions by tier
  const groupedMissions = useMemo(() => {
    const groups = new Map<number, TierMission[]>();

    filteredMissions.forEach(mission => {
      const tier = mission.requiredTier;
      if (!groups.has(tier)) {
        groups.set(tier, []);
      }
      groups.get(tier)!.push(mission);
    });

    return Array.from(groups.entries()).sort(([a], [b]) => a - b);
  }, [filteredMissions]);

  // Daily mission count for current tier
  const dailyMissionCount = missions.filter(m => m.isAvailable).length;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-dark rounded-xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">
            Available Missions
          </h3>

          {/* Daily count badge */}
          <div
            className={`
              px-3 py-1 rounded-full text-sm font-medium
              bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo}
              text-white
            `}
          >
            {dailyMissionCount} Today
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-400">{stats.available} Available</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-400">{stats.completed} Completed</span>
          </div>
          {showLocked && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-500" />
              <span className="text-gray-400">{stats.locked} Locked</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 py-2 flex gap-2 border-b border-slate-700/50 bg-slate-800/30">
        {(['all', 'available', 'completed', ...(showLocked ? ['locked'] : [])] as MissionFilter[]).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`
              px-3 py-1 rounded text-xs font-medium transition-all
              ${filter === filterOption
                ? `bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} text-white`
                : 'bg-slate-700/50 text-gray-400 hover:text-white'
              }
            `}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {/* Missions list */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {groupedMissions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-gray-500"
            >
              No missions match the current filter
            </motion.div>
          ) : (
            groupedMissions.map(([tierNumber, tierMissions]) => {
              const tierColors = getTierColors(tierNumber);
              const tierNames: Record<number, string> = {
                1: 'Ignition',
                2: 'Cruiser',
                3: 'Turbo',
                4: 'Supersonic',
              };

              return (
                <motion.div
                  key={tierNumber}
                  layout
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 last:mb-0"
                >
                  {/* Tier header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`
                        w-6 h-6 rounded-full flex items-center justify-center
                        text-xs font-bold text-white
                        ${tierNumber <= playerTier ? tierColors.bg : 'bg-slate-700'}
                      `}
                    >
                      {tierNumber}
                    </div>
                    <span
                      className={`
                        text-xs font-semibold uppercase tracking-wider
                        ${tierNumber <= playerTier ? tierColors.text : 'text-gray-500'}
                      `}
                    >
                      {tierNames[tierNumber]} Missions
                    </span>
                    {tierNumber > playerTier && (
                      <span className="text-xs text-gray-600 ml-auto">
                        Reach {tierNames[tierNumber]} to unlock
                      </span>
                    )}
                  </div>

                  {/* Missions for this tier */}
                  <div className="space-y-2">
                    {tierMissions.map(mission => (
                      <MissionTierRow
                        key={mission.id}
                        mission={mission}
                        playerTier={playerTier}
                        onClick={onMissionClick}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Footer hint */}
      {stats.locked > 0 && filter !== 'locked' && (
        <div className="px-4 py-3 bg-slate-800/30 border-t border-slate-700/50">
          <p className="text-xs text-gray-500 text-center">
            Level up to unlock {stats.locked} more mission{stats.locked > 1 ? 's' : ''}!
          </p>
        </div>
      )}
    </motion.div>
  );
}
