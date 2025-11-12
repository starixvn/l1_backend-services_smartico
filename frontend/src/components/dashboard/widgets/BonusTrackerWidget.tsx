/**
 * BonusTrackerWidget Component
 * Displays active bonus offers with expiration timers and claim actions.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { AnimatedCard, SkeletonLoader, EmptyState } from '../shared';
import type { Bonus } from '../../../types/dashboard/data';

/**
 * Bonus type icon mapping.
 */
const BONUS_ICONS: Record<Bonus['type'], string> = {
  deposit: '💰',
  cashback: '🔄',
  'free-spins': '🎰',
  loyalty: '⭐',
};

/**
 * Bonus type color mapping.
 */
const BONUS_COLORS: Record<Bonus['type'], string> = {
  deposit: 'from-green-600 to-emerald-600',
  cashback: 'from-blue-600 to-cyan-600',
  'free-spins': 'from-purple-600 to-pink-600',
  loyalty: 'from-yellow-600 to-orange-600',
};

/**
 * Get time remaining until expiration.
 */
function getTimeRemaining(expiresAt: string): { hours: number; minutes: number; isExpiringSoon: boolean } {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = Math.max(0, expiry - now);

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return {
    hours,
    minutes,
    isExpiringSoon: hours < 24, // Less than 24 hours
  };
}

/**
 * Bonus card component with claim action.
 */
function BonusCard({ bonus, onClaim }: { bonus: Bonus; onClaim: (id: number) => void }) {
  const prefersReducedMotion = useReducedMotion();
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(bonus.expiresAt));

  // Update timer every minute
  useEffect(() => {
    const updateTimer = () => {
      setTimeRemaining(getTimeRemaining(bonus.expiresAt));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [bonus.expiresAt]);

  return (
    <motion.div
      layout
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`
        glass-dark-subtle p-4 rounded-lg border
        ${bonus.claimed ? 'border-gray-700/50 opacity-60' : 'border-purple-500/30 hover:border-purple-500/50'}
        transition-all
      `}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`
            flex-shrink-0 w-12 h-12 rounded-full
            bg-gradient-to-br ${BONUS_COLORS[bonus.type]}
            flex items-center justify-center text-2xl
          `}
        >
          {BONUS_ICONS[bonus.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-base font-semibold text-white truncate">
              {bonus.name}
            </h4>
            {bonus.claimed && (
              <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded">
                Claimed
              </span>
            )}
          </div>

          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {bonus.description}
          </p>

          {/* Expiration Timer */}
          <div className="flex items-center justify-between gap-2">
            <div
              className={`
                text-xs font-medium
                ${timeRemaining.isExpiringSoon ? 'text-red-400' : 'text-gray-400'}
              `}
            >
              {timeRemaining.hours > 0 ? (
                <>⏰ {timeRemaining.hours}h {timeRemaining.minutes}m left</>
              ) : timeRemaining.minutes > 0 ? (
                <>⏰ {timeRemaining.minutes}m left</>
              ) : (
                <>⏰ Expired</>
              )}
            </div>

            {/* Claim Button */}
            {!bonus.claimed && (
              <motion.button
                whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                onClick={() => onClaim(bonus.id)}
                className="px-4 py-1.5 text-white text-sm font-medium rounded-lg transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900"
                style={{
                  background: 'linear-gradient(to right, var(--color-primary), var(--color-accent))',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
              >
                Claim
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * BonusTrackerWidget component.
 * Displays active bonus offers with expiration timers.
 */
export function BonusTrackerWidget() {
  const { data, isLoading } = useDashboardData();
  const bonuses = data?.bonuses || [];
  const [localBonuses, setLocalBonuses] = useState<Bonus[]>([]);

  // Initialize local bonuses from data
  useEffect(() => {
    if (data?.bonuses) {
      setLocalBonuses(data.bonuses);
    }
  }, [data?.bonuses]);

  // Handle bonus claim
  const handleClaim = (bonusId: number) => {
    // TODO: Call bonusService.claimBonus(bonusId)
    // Update local state optimistically
    setLocalBonuses((prev) =>
      prev.map((bonus) =>
        bonus.id === bonusId ? { ...bonus, claimed: true } : bonus
      )
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <AnimatedCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🎁</span> Active Bonuses
        </h3>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonLoader key={i} variant="card" height={100} />
          ))}
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🎁</span> Active Bonuses
        </h3>
        <span className="text-sm text-gray-400">
          {localBonuses.filter((b) => !b.claimed).length} available
        </span>
      </div>

      {localBonuses.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
          }
          title="No Active Bonuses"
          description="Check back later for new bonus offers and exclusive rewards!"
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {localBonuses.map((bonus) => (
              <BonusCard key={bonus.id} bonus={bonus} onClaim={handleClaim} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* TODO: SignalR listener for bonus-available event */}
      {/* TODO: SignalR listener for bonus-claimed event */}
    </AnimatedCard>
  );
}
