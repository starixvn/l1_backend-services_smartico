/**
 * JackpotWidget Component
 * Displays jackpot prize pool with countdown and recent winners.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { AnimatedCard, SkeletonLoader, EmptyState } from '../shared';

/**
 * Get time remaining until jackpot draw.
 */
function getTimeRemaining(drawDate: string): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date().getTime();
  const draw = new Date(drawDate).getTime();
  const diff = Math.max(0, draw - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

/**
 * Animated counter component for prize pool.
 */
function AnimatedPrizeCounter({ amount }: { amount: number }) {
  const [displayAmount, setDisplayAmount] = useState(amount);

  useEffect(() => {
    // Animate to new amount
    const duration = 1000;
    const steps = 30;
    const increment = (amount - displayAmount) / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayAmount(amount);
        clearInterval(interval);
      } else {
        setDisplayAmount((prev) => prev + increment);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [amount]);

  return (
    <span className="font-mono">
      {Math.round(displayAmount).toLocaleString()}
    </span>
  );
}

/**
 * JackpotWidget component.
 * Displays jackpot with prize pool, tickets, and countdown.
 */
export function JackpotWidget() {
  const { data, isLoading } = useDashboardData();
  const jackpot = data?.jackpot;
  const prefersReducedMotion = useReducedMotion();

  const [timeRemaining, setTimeRemaining] = useState(
    jackpot ? getTimeRemaining(jackpot.drawDate) : { days: 0, hours: 0, minutes: 0, seconds: 0 }
  );

  // Update countdown timer (every second for jackpot)
  useEffect(() => {
    if (!jackpot?.drawDate) return;

    const updateTimer = () => {
      setTimeRemaining(getTimeRemaining(jackpot.drawDate));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [jackpot?.drawDate]);

  // Loading state
  if (isLoading) {
    return (
      <AnimatedCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>💎</span> Jackpot
        </h3>
        <SkeletonLoader variant="card" height={400} />
      </AnimatedCard>
    );
  }

  // No jackpot active
  if (!jackpot) {
    return (
      <AnimatedCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>💎</span> Jackpot
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
          title="No Active Jackpot"
          description="A new jackpot will be available soon! Stay tuned for big prizes."
        />
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-pink-500/10 pointer-events-none" />
      {!prefersReducedMotion && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none"
        />
      )}

      <div className="relative">
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            animate={prefersReducedMotion ? {} : { rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-5xl mb-2"
          >
            💎
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-1">Mega Jackpot</h3>
          <p className="text-sm text-gray-400">Grand Prize Draw</p>
        </div>

        {/* Prize Pool */}
        <div className="text-center mb-6">
          <div className="text-xs text-gray-400 mb-2">Current Prize Pool</div>
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent"
          >
            <AnimatedPrizeCounter amount={jackpot.prizePool} /> 💰
          </motion.div>
        </div>

        {/* Countdown Timer */}
        <div className="glass-dark-strong rounded-lg p-4 mb-4">
          <div className="text-xs text-gray-400 text-center mb-3">Draw in</div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Days', value: timeRemaining.days },
              { label: 'Hours', value: timeRemaining.hours },
              { label: 'Min', value: timeRemaining.minutes },
              { label: 'Sec', value: timeRemaining.seconds },
            ].map((unit) => (
              <div key={unit.label} className="text-center">
                <motion.div
                  key={unit.value}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-bold text-white bg-slate-700/50 rounded-lg py-2 mb-1"
                >
                  {unit.value.toString().padStart(2, '0')}
                </motion.div>
                <div className="text-xs text-gray-400">{unit.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* User Tickets */}
        <div className="glass-dark-subtle rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Your Tickets</div>
              <div className="text-xl font-bold text-white">
                🎫 {jackpot.userTickets}
              </div>
            </div>
            <motion.button
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
              className="
                px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600
                hover:from-yellow-700 hover:to-orange-700
                text-white text-sm font-medium rounded-lg
                transition-all shadow-lg shadow-yellow-500/30
                focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900
              "
            >
              Buy Tickets
            </motion.button>
          </div>
        </div>

        {/* Recent Winners */}
        {jackpot.lastWinners.length > 0 && (
          <div>
            <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
              <span>🏆</span> Recent Winners
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {jackpot.lastWinners.slice(0, 3).map((winner, index) => (
                  <motion.div
                    key={`${winner.username}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-dark-subtle rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                        {winner.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-300">{winner.username}</span>
                    </div>
                    <span className="text-sm font-semibold text-yellow-400">
                      {winner.amount.toLocaleString()} 💰
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* TODO: SignalR listener for jackpot-update event */}
        {/* TODO: SignalR listener for jackpot-won event */}
      </div>
    </AnimatedCard>
  );
}
