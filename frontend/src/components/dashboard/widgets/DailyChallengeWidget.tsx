/**
 * DailyChallengeWidget Component
 * Displays daily challenge with countdown timer and progress.
 */

import { useState, useEffect } from 'react';
import { AnimatedCard } from '../shared/AnimatedCard';
import { SkeletonLoader } from '../shared/SkeletonLoader';
import { useDashboardData } from '../../../hooks/useDashboardData';

/**
 * Calculate time remaining until deadline.
 */
function getTimeRemaining(deadline: string): { hours: number; minutes: number; seconds: number } {
  const now = new Date().getTime();
  const end = new Date(deadline).getTime();
  const diff = Math.max(0, end - now);

  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

/**
 * DailyChallengeWidget component.
 * Shows today's challenge with countdown and progress.
 */
export function DailyChallengeWidget() {
  const { data, isLoading } = useDashboardData();
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Get daily challenge (first mission from mock data)
  const challenge = data?.missions?.[0];

  // Update countdown timer
  useEffect(() => {
    const deadline = challenge?.deadline;
    if (!deadline) return;

    const updateTimer = () => {
      setTimeRemaining(getTimeRemaining(deadline));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [challenge?.deadline]);

  // TODO: Add SignalR listener for mission completion
  // useEffect(() => {
  //   const handleMissionComplete = (event: MissionCompleteEvent) => {
  //     if (event.missionId === challenge?.id) {
  //       // Trigger celebration, update UI
  //     }
  //   };
  //   signalrService.on('mission-complete', handleMissionComplete);
  //   return () => signalrService.off('mission-complete', handleMissionComplete);
  // }, [challenge?.id]);

  if (isLoading) {
    return (
      <AnimatedCard className="p-6">
        <SkeletonLoader variant="text" lines={3} />
        <SkeletonLoader variant="rectangular" height="4rem" className="mt-4" />
      </AnimatedCard>
    );
  }

  if (!challenge) {
    return (
      <AnimatedCard className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-400">No daily challenge available</p>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Daily Challenge
        </h3>
        {/* Countdown Timer */}
        <div className="flex items-center gap-1 text-sm">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-300 font-mono">
            {timeRemaining.hours}h {timeRemaining.minutes}m
          </span>
        </div>
      </div>

      {/* Challenge Name */}
      <h4 className="text-xl font-semibold text-white mb-2">{challenge.name}</h4>

      {/* Challenge Description */}
      <p className="text-gray-400 text-sm mb-4">{challenge.description}</p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className="text-purple-400 font-semibold">{challenge.progress}%</span>
        </div>
        <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${challenge.progress}%` }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-gray-500">{challenge.currentValue} / {challenge.targetValue}</span>
          <span className="text-green-400">+{challenge.rewardPoints} pts</span>
        </div>
      </div>

      {/* Action Button */}
      {challenge.isCompleted ? (
        <div className="flex items-center justify-center gap-2 py-3 bg-green-500/20 border border-green-500/50 rounded-lg">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-green-400 font-medium">Completed!</span>
        </div>
      ) : (
        <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900">
          Continue Challenge
        </button>
      )}
    </AnimatedCard>
  );
}
