/**
 * RecentAchievementsWidget Component
 * Displays recent achievements with 3D flip card animation.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedCard } from '../shared/AnimatedCard';
import { SkeletonLoader } from '../shared/SkeletonLoader';
import { EmptyState } from '../shared/EmptyState';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useDashboardData } from '../../../hooks/useDashboardData';
import type { Rarity } from '../../../types/dashboard/components';

/**
 * AchievementFlipCard component.
 * 3D flip card with front (icon, name) and back (description, rarity).
 */
function AchievementFlipCard({
  achievement,
  index,
}: {
  achievement: {
    id: number;
    name: string;
    description: string;
    iconUrl?: string;
    earnedAt: string;
    isNew: boolean;
    rarity: Rarity;
  };
  index: number;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const isNewAchievement = achievement.isNew &&
    Date.now() - new Date(achievement.earnedAt).getTime() < 24 * 60 * 60 * 1000;

  const rarityColors: Record<Rarity, string> = {
    common: 'from-gray-600 to-gray-700',
    rare: 'from-blue-600 to-blue-700',
    epic: 'from-purple-600 to-purple-700',
    legendary: 'from-yellow-600 to-orange-600',
    mythic: 'from-pink-600 to-rose-700',
  };

  return (
    <div
      className="relative h-32 cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsFlipped(!isFlipped);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Achievement: ${achievement.name}. Click to flip.`}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.6,
          type: 'spring',
          stiffness: 80,
          damping: 15,
        }}
      >
        {/* Front Side */}
        <div
          className={`absolute inset-0 rounded-lg bg-gradient-to-br ${rarityColors[achievement.rarity]} p-4 flex flex-col items-center justify-center border border-white/20`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* New Badge */}
          {isNewAchievement && (
            <motion.div
              className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              NEW!
            </motion.div>
          )}

          {/* Icon */}
          <div className="text-4xl mb-2">
            {achievement.iconUrl ? (
              <img src={achievement.iconUrl} alt="" className="w-12 h-12" />
            ) : (
              '🏆'
            )}
          </div>

          {/* Name */}
          <h4 className="text-sm font-bold text-white text-center line-clamp-2">
            {achievement.name}
          </h4>

          {/* Date */}
          <p className="text-xs text-white/70 mt-1">
            {new Date(achievement.earnedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Back Side */}
        <div
          className={`absolute inset-0 rounded-lg bg-gradient-to-br ${rarityColors[achievement.rarity]} p-4 flex flex-col justify-center border border-white/20`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Description */}
          <p className="text-xs text-white/90 text-center mb-3 line-clamp-3">
            {achievement.description}
          </p>

          {/* Rarity */}
          <div className="text-center">
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wide px-2 py-1 bg-black/20 rounded">
              {achievement.rarity}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * RecentAchievementsWidget component.
 * Shows last 6 achievements in a grid with flip cards.
 */
export function RecentAchievementsWidget() {
  const { data, isLoading } = useDashboardData();

  // Get recent achievements (limit to 6)
  const achievements = data?.achievements?.slice(0, 6) || [];

  // TODO: Add SignalR listener for new achievements
  // useEffect(() => {
  //   const handleNewAchievement = (event: AchievementEarnedEvent) => {
  //     // Show celebration, add to list
  //   };
  //   signalrService.on('achievement-earned', handleNewAchievement);
  //   return () => signalrService.off('achievement-earned', handleNewAchievement);
  // }, []);

  if (isLoading) {
    return (
      <AnimatedCard className="p-6">
        <SkeletonLoader variant="text" lines={1} className="mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonLoader key={i} variant="rectangular" height="8rem" />
          ))}
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          Recent Achievements
        </h3>
        <span className="text-sm text-gray-400">{achievements.length} earned</span>
      </div>

      {/* Achievement Grid */}
      {achievements.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
          title="No Achievements Yet"
          description="Complete challenges to earn your first achievement"
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <AchievementFlipCard
              key={achievement.id}
              achievement={achievement}
              index={index}
            />
          ))}
        </div>
      )}

      {/* View All Button */}
      {achievements.length > 0 && (
        <button className="w-full mt-4 py-2 text-sm text-purple-400 hover:text-purple-300 font-medium border border-purple-500/30 hover:border-purple-500/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900">
          View All Achievements →
        </button>
      )}
    </AnimatedCard>
  );
}
