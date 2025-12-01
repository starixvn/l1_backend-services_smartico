/**
 * JackpotWidget Component
 * Displays list of jackpots with opt-in functionality.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { AnimatedCard, SkeletonLoader, EmptyState } from '../shared';
import type { Jackpot } from '../../../types/dashboard/data';

/**
 * Get temperature color based on jackpot temperature.
 */
function getTemperatureColor(temp: Jackpot['temperature']): string {
  switch (temp) {
    case 'cold': return 'from-blue-400 to-blue-600';
    case 'warm': return 'from-yellow-400 to-orange-500';
    case 'hot': return 'from-orange-500 to-red-500';
    case 'burning': return 'from-red-500 to-pink-600';
    default: return 'from-blue-400 to-blue-600';
  }
}

/**
 * Get temperature emoji based on jackpot temperature.
 */
function getTemperatureEmoji(temp: Jackpot['temperature']): string {
  switch (temp) {
    case 'cold': return '❄️';
    case 'warm': return '🔥';
    case 'hot': return '🔥🔥';
    case 'burning': return '💥';
    default: return '❄️';
  }
}

/**
 * Get time remaining until jackpot draw.
 */
function getTimeRemaining(drawDate: string): string {
  const now = new Date().getTime();
  const draw = new Date(drawDate).getTime();
  const diff = Math.max(0, draw - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Single Jackpot Card component.
 */
function JackpotCard({
  jackpot,
  isSelected,
  onSelect,
  prefersReducedMotion
}: {
  jackpot: Jackpot;
  isSelected: boolean;
  onSelect: () => void;
  prefersReducedMotion: boolean;
}) {
  const tempColor = getTemperatureColor(jackpot.temperature);
  const tempEmoji = getTemperatureEmoji(jackpot.temperature);

  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      onClick={onSelect}
      className={`
        relative p-4 rounded-xl cursor-pointer transition-all border-2
        ${isSelected
          ? 'border-yellow-500 bg-yellow-500/10'
          : 'border-transparent bg-slate-800/50 hover:bg-slate-700/50'
        }
      `}
    >
      {/* Temperature indicator */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${tempColor} text-white`}>
        {tempEmoji} {jackpot.temperature.toUpperCase()}
      </div>

      {/* Jackpot Name */}
      <h4 className="text-lg font-bold text-white mb-1 pr-20">
        {jackpot.name}
      </h4>

      {/* Description */}
      <p className="text-xs text-gray-400 mb-3 line-clamp-2">
        {jackpot.description || 'Win big with this jackpot!'}
      </p>

      {/* Prize Pool */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs text-gray-500">Prize Pool</div>
          <div className={`text-2xl font-bold bg-gradient-to-r ${tempColor} bg-clip-text text-transparent`}>
            {jackpot.currency} {jackpot.prizePool.toLocaleString()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Draw in</div>
          <div className="text-sm font-medium text-white">
            {getTimeRemaining(jackpot.drawDate)}
          </div>
        </div>
      </div>

      {/* Opt-in Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">👥 {jackpot.userTickets} players</span>
        </div>
        <div className={`
          px-3 py-1 rounded-full text-xs font-medium
          ${jackpot.isOptedIn
            ? 'bg-green-500/20 text-green-400'
            : 'bg-gray-600/30 text-gray-400'
          }
        `}>
          {jackpot.isOptedIn ? '✓ Opted In' : 'Not Opted In'}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * JackpotWidget component.
 * Displays list of jackpots with selection and opt-in.
 */
export function JackpotWidget() {
  const { data, isLoading } = useDashboardData();
  const jackpots = data?.jackpots ?? [];
  const prefersReducedMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Select first jackpot by default
  useEffect(() => {
    if (jackpots.length > 0 && selectedId === null) {
      setSelectedId(jackpots[0].id);
    }
  }, [jackpots, selectedId]);

  const selectedJackpot = jackpots.find(j => j.id === selectedId);

  // Loading state
  if (isLoading) {
    return (
      <AnimatedCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>💎</span> Jackpots
        </h3>
        <SkeletonLoader variant="card" height={200} />
      </AnimatedCard>
    );
  }

  // No jackpots active
  if (jackpots.length === 0) {
    return (
      <AnimatedCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>💎</span> Jackpots
        </h3>
        <EmptyState
          icon={
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          title="No Active Jackpots"
          description="New jackpots will be available soon! Stay tuned for big prizes."
        />
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-pink-500/5 pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>💎</span> Jackpots
          </h3>
          <span className="text-sm text-gray-400">{jackpots.length} available</span>
        </div>

        {/* Jackpot List */}
        <div className="space-y-3 mb-4">
          <AnimatePresence>
            {jackpots.map((jackpot) => (
              <JackpotCard
                key={jackpot.id}
                jackpot={jackpot}
                isSelected={selectedId === jackpot.id}
                onSelect={() => setSelectedId(jackpot.id)}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Action Button for Selected Jackpot */}
        {selectedJackpot && (
          <motion.button
            whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            className={`
              w-full py-3 rounded-lg font-medium text-white transition-all
              ${selectedJackpot.isOptedIn
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
              }
            `}
          >
            {selectedJackpot.isOptedIn ? 'Opt Out' : `Opt In to ${selectedJackpot.name}`}
          </motion.button>
        )}
      </div>
    </AnimatedCard>
  );
}
