/**
 * TournamentWidget Component
 * Displays active tournament with user rank and countdown timer.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { AnimatedCard, SkeletonLoader, EmptyState, ProgressRing } from '../shared';

/**
 * Get time remaining until tournament end.
 */
function getTimeRemaining(endsAt: string): { days: number; hours: number; minutes: number } {
  const now = new Date().getTime();
  const end = new Date(endsAt).getTime();
  const diff = Math.max(0, end - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
  };
}

/**
 * Get rank tier (top 10%, top 25%, etc.)
 */
function getRankTier(rank: number, total: number): { tier: string; color: string; emoji: string } {
  const percentile = (rank / total) * 100;

  if (rank === 1) return { tier: '1st Place', color: 'text-yellow-400', emoji: '🥇' };
  if (rank === 2) return { tier: '2nd Place', color: 'text-gray-300', emoji: '🥈' };
  if (rank === 3) return { tier: '3rd Place', color: 'text-orange-400', emoji: '🥉' };
  if (percentile <= 10) return { tier: 'Top 10%', color: 'text-purple-400', emoji: '🌟' };
  if (percentile <= 25) return { tier: 'Top 25%', color: 'text-blue-400', emoji: '⭐' };
  if (percentile <= 50) return { tier: 'Top 50%', color: 'text-green-400', emoji: '✨' };

  return { tier: `Rank #${rank}`, color: 'text-gray-400', emoji: '📊' };
}

/**
 * TournamentWidget component.
 * Displays active tournament with user rank and countdown.
 */
export function TournamentWidget() {
  const { data, isLoading } = useDashboardData();
  const tournament = data?.tournament;
  const prefersReducedMotion = useReducedMotion();

  const [timeRemaining, setTimeRemaining] = useState(
    tournament ? getTimeRemaining(tournament.endsAt) : { days: 0, hours: 0, minutes: 0 }
  );

  // Update countdown timer
  useEffect(() => {
    if (!tournament?.endsAt) return;

    const updateTimer = () => {
      setTimeRemaining(getTimeRemaining(tournament.endsAt));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [tournament?.endsAt]);

  // Loading state
  if (isLoading) {
    return (
      <AnimatedCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🏆</span> Tournament
        </h3>
        <SkeletonLoader variant="card" height={300} />
      </AnimatedCard>
    );
  }

  // No tournament active
  if (!tournament) {
    return (
      <AnimatedCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🏆</span> Tournament
        </h3>
        <EmptyState
          icon={
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          }
          title="No Active Tournament"
          description="Stay tuned! New tournaments will be announced soon."
        />
      </AnimatedCard>
    );
  }

  const rankInfo = getRankTier(tournament.userRank, tournament.totalParticipants);
  const rankProgress = 100 - (tournament.userRank / tournament.totalParticipants) * 100;

  return (
    <AnimatedCard className="p-6 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🏆</span> Tournament
          </h3>

          {/* Countdown Timer */}
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1">Ends in</div>
            <div className="text-sm font-bold text-white">
              {timeRemaining.days > 0 && <>{timeRemaining.days}d </>}
              {timeRemaining.hours}h {timeRemaining.minutes}m
            </div>
          </div>
        </div>

        {/* Tournament Name */}
        <h4 className="text-lg font-semibold text-white mb-4">
          {tournament.name}
        </h4>

        {/* Rank Display */}
        <div className="flex items-center gap-6 mb-6">
          {/* Progress Ring */}
          <div className="flex-shrink-0">
            <ProgressRing
              progress={rankProgress}
              size={100}
              thickness={8}
              color="url(#tournament-gradient)"
              showPercentage={false}
              showGlow={tournament.userRank <= 3}
            />
            <svg width="0" height="0">
              <defs>
                <linearGradient id="tournament-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
            </svg>

            {/* Rank in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl mb-1">{rankInfo.emoji}</div>
                <div className={`text-lg font-bold ${rankInfo.color}`}>
                  #{tournament.userRank}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1">
            <div className="space-y-3">
              {/* Rank Tier */}
              <div>
                <div className="text-xs text-gray-400 mb-1">Your Position</div>
                <div className={`text-base font-semibold ${rankInfo.color}`}>
                  {rankInfo.tier}
                </div>
              </div>

              {/* Participants */}
              <div>
                <div className="text-xs text-gray-400 mb-1">Participants</div>
                <div className="text-base font-semibold text-white">
                  {tournament.totalParticipants.toLocaleString()} players
                </div>
              </div>

              {/* Prize Pool */}
              <div>
                <div className="text-xs text-gray-400 mb-1">Prize Pool</div>
                <div className="text-base font-semibold text-yellow-400">
                  💰 {tournament.prizePool.toLocaleString()} coins
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rank Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Rank Progress</span>
            <span>{rankInfo.tier}</span>
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${rankProgress}%` }}
              transition={{ duration: 1, type: 'spring', stiffness: 50, damping: 15 }}
              className="h-full relative"
              style={{
                background: 'linear-gradient(to right, #d97706, #ea580c)',
              }}
            >
              {/* Shine effect */}
              {!prefersReducedMotion && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              )}
            </motion.div>
          </div>
        </div>

        {/* View Leaderboard Button */}
        <motion.button
          whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          className="w-full py-2.5 text-white font-medium rounded-lg transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900"
          style={{
            background: 'linear-gradient(to right, #d97706, #ea580c)',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          View Leaderboard →
        </motion.button>

        {/* TODO: SignalR listener for tournament-rank-update event */}
        {/* TODO: SignalR listener for tournament-ended event */}
      </div>
    </AnimatedCard>
  );
}
