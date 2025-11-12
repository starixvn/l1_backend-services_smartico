/**
 * LevelProgressWidget Component
 * Displays user level and XP progress with circular ring.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCard } from '../shared/AnimatedCard';
import { ProgressRing } from '../shared/ProgressRing';
import { ParticleEffect } from '../shared/ParticleEffect';
import { SkeletonLoader } from '../shared/SkeletonLoader';
import { useDashboardData } from '../../../hooks/useDashboardData';

/**
 * LevelProgressWidget component.
 * Shows current level, XP, and progress to next level.
 */
export function LevelProgressWidget() {
  const { data, isLoading } = useDashboardData();
  const [showLevelUpCelebration, setShowLevelUpCelebration] = useState(false);
  const [xpGain, setXpGain] = useState<number | null>(null);

  const level = data?.level;

  // TODO: Add SignalR listener for level-up
  // useEffect(() => {
  //   const handleLevelUp = (event: LevelUpEvent) => {
  //     setShowLevelUpCelebration(true);
  //     setTimeout(() => setShowLevelUpCelebration(false), 5000);
  //   };
  //   signalrService.on('level-up', handleLevelUp);
  //   return () => signalrService.off('level-up', handleLevelUp);
  // }, []);

  // TODO: Add SignalR listener for XP gains
  // useEffect(() => {
  //   const handleXpGain = (amount: number) => {
  //     setXpGain(amount);
  //     setTimeout(() => setXpGain(null), 2000);
  //   };
  //   signalrService.on('xp-gained', handleXpGain);
  //   return () => signalrService.off('xp-gained', handleXpGain);
  // }, []);

  if (isLoading) {
    return (
      <AnimatedCard className="p-6">
        <SkeletonLoader variant="circular" width="120px" height="120px" className="mx-auto" />
        <SkeletonLoader variant="text" lines={2} className="mt-4" />
      </AnimatedCard>
    );
  }

  if (!level) {
    return (
      <AnimatedCard className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-400">Level data unavailable</p>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <>
      <AnimatedCard className="p-6 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 -z-10" />

        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
            <span className="text-2xl">⭐</span>
            Level Progress
          </h3>
        </div>

        {/* Progress Ring */}
        <div className="flex justify-center mb-4 relative">
          <ProgressRing
            progress={level.xpProgress}
            size={140}
            thickness={12}
            color="url(#level-gradient)"
            showPercentage={false}
            showGlow={level.xpProgress >= 100}
          />

          {/* SVG Gradient Definition */}
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <linearGradient id="level-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-white">{level.currentLevel}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Level</div>
          </div>

          {/* Floating XP Gain */}
          <AnimatePresence>
            {xpGain && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.8 }}
                animate={{ opacity: 1, y: -30, scale: 1 }}
                exit={{ opacity: 0, y: -60 }}
                transition={{ duration: 0.5 }}
                className="absolute top-0 right-0 text-green-400 font-bold text-lg"
              >
                +{xpGain} XP
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* XP Stats */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-gray-400">XP:</span>
            <span className="text-white font-semibold">
              {level.currentXP.toLocaleString()} / {level.xpToNextLevel.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {(level.xpToNextLevel - level.currentXP).toLocaleString()} XP to level {level.currentLevel + 1}
          </div>
        </div>

        {/* Progress Bar (Alternative visualization) */}
        <div className="mt-4">
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${level.xpProgress}%` }}
            />
          </div>
        </div>
      </AnimatedCard>

      {/* Level-Up Celebration */}
      {showLevelUpCelebration && (
        <>
          <ParticleEffect
            type="confetti"
            count={50}
            duration={3000}
            isActive={true}
            onComplete={() => setShowLevelUpCelebration(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: 3,
              }}
              className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-600"
              style={{ textShadow: '0 0 20px rgba(251, 191, 36, 0.5)' }}
            >
              LEVEL UP!
            </motion.div>
          </motion.div>
        </>
      )}
    </>
  );
}
