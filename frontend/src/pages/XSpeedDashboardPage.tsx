/**
 * XSpeedDashboardPage - Velocity Program Level Dashboard
 * T074-T081: Main page assembling all velocity components.
 */

import { useState, useCallback } from 'react';
import { DashboardLayout } from '../components/dashboard/layout';
import { DashboardProvider } from '../contexts';

// Velocity components
import { VelocityTierCard } from '../components/velocity/VelocityTierCard';
import { TierJourneyProgress } from '../components/velocity/TierJourneyProgress';
import { NextTierPreview } from '../components/velocity/NextTierPreview';
import { TierBenefitsList } from '../components/velocity/TierBenefitsList';
import { MissionAvailabilityCard } from '../components/velocity/MissionAvailabilityCard';
import { XPActivityFeed } from '../components/velocity/XPActivityFeed';
import { LevelUpCelebration } from '../components/velocity/LevelUpCelebration';

// Hooks
import { useVelocityProgress } from '../hooks/useVelocityProgress';
import { useVelocityTiers } from '../hooks/useVelocityTiers';
import { useXPActivity } from '../hooks/useXPActivity';
import { useLevelUpEvents } from '../hooks/useLevelUpEvents';

// Types
import type { TierMission, VelocityTier } from '../types/velocity';

/**
 * Loading skeleton component for widgets.
 */
function WidgetSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-dark rounded-xl p-6 animate-pulse ${className}`}>
      <div className="h-6 w-32 bg-slate-700 rounded mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-slate-700 rounded w-3/4" />
        <div className="h-4 bg-slate-700 rounded w-1/2" />
        <div className="h-20 bg-slate-700 rounded mt-4" />
      </div>
    </div>
  );
}

/**
 * Error display component.
 */
function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="glass-dark rounded-xl p-6 border border-red-500/30">
      <div className="flex items-center gap-3 text-red-400">
        <span className="text-2xl">⚠️</span>
        <div>
          <p className="font-semibold">Error loading data</p>
          <p className="text-sm text-gray-400">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * Demo user ID for development.
 */
const DEMO_USER_ID = 'demo-user';

/**
 * XSpeedDashboardPage component.
 * Main dashboard page for the Velocity Program.
 */
export function XSpeedDashboardPage() {
  // State for selected tier details
  const [selectedTier, setSelectedTier] = useState<VelocityTier | null>(null);

  // Fetch velocity progress
  const {
    data: progress,
    isLoading: progressLoading,
    error: progressError,
    refetch: refetchProgress,
  } = useVelocityProgress(DEMO_USER_ID);

  // Fetch tier definitions
  const {
    data: tiers,
    isLoading: tiersLoading,
    error: tiersError,
    getTier,
    getNextTier,
    refetch: refetchTiers,
  } = useVelocityTiers();

  // Fetch XP activity
  const {
    data: activities,
    isLoading: activitiesLoading,
    totalCount: activityCount,
    filterType,
    setFilterType,
    refetch: refetchActivities,
    loadMore: loadMoreActivities,
    hasMore: hasMoreActivities,
  } = useXPActivity(DEMO_USER_ID);

  // Level-up events
  const {
    currentEvent: levelUpEvent,
    acknowledgeCurrentEvent,
    hasPendingEvents,
  } = useLevelUpEvents({ userId: DEMO_USER_ID });

  // Derived state
  const currentTier = progress ? getTier(progress.currentTier) : null;
  const nextTier = progress ? getNextTier(progress.currentTier) : null;

  // Demo missions data (would come from API in production)
  const [missions] = useState<TierMission[]>([
    {
      id: '1',
      name: 'The Daily Driver',
      description: 'Complete your daily challenge',
      requiredTier: 1,
      isAvailable: true,
      isCompleted: false,
      xpReward: 50,
      rewards: [{ type: 'free_spins', value: 10, description: '10 Free Spins' }],
    },
    {
      id: '2',
      name: 'High Roller',
      description: 'Wager $100 on any game',
      requiredTier: 2,
      isAvailable: (progress?.currentTier ?? 0) >= 2,
      isCompleted: false,
      xpReward: 100,
      rewards: [{ type: 'cash', value: 5, description: '$5 Bonus' }],
    },
    {
      id: '3',
      name: 'Table Tactician',
      description: 'Win 5 hands of Blackjack',
      requiredTier: 3,
      isAvailable: (progress?.currentTier ?? 0) >= 3,
      isCompleted: false,
      xpReward: 150,
      rewards: [{ type: 'xp_boost', value: 2, description: '2x XP Boost' }],
    },
    {
      id: '4',
      name: 'Whale Challenge',
      description: 'Exclusive VIP mission',
      requiredTier: 4,
      isAvailable: (progress?.currentTier ?? 0) >= 4,
      isCompleted: false,
      xpReward: 500,
      rewards: [{ type: 'badge', value: 1, description: 'Whale Badge' }],
    },
  ]);

  // Handlers
  const handleMilestoneClick = useCallback((tier: VelocityTier) => {
    setSelectedTier(tier);
  }, []);

  const handleMissionClick = useCallback((mission: TierMission) => {
    console.log('Mission clicked:', mission);
    // Navigate to mission details or start mission
  }, []);

  const handlePlayNowClick = useCallback(() => {
    console.log('Play Now clicked');
    // Navigate to games
  }, []);

  const handleRetry = useCallback(() => {
    refetchProgress();
    refetchTiers();
    refetchActivities();
  }, [refetchProgress, refetchTiers, refetchActivities]);

  // Loading state
  const isLoading = progressLoading || tiersLoading;

  // Error state
  const error = progressError || tiersError;

  return (
    <DashboardProvider>
      <DashboardLayout pageTitle="Velocity Program">
        {/* T080: Level-up celebration modal */}
        <LevelUpCelebration
          event={levelUpEvent}
          onAcknowledge={acknowledgeCurrentEvent}
        />

        {/* Error state */}
        {error && (
          <ErrorMessage
            message={error}
            onRetry={handleRetry}
          />
        )}

        {/* Loading state */}
        {isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <WidgetSkeleton className="lg:col-span-2" />
            <WidgetSkeleton />
            <WidgetSkeleton className="lg:col-span-3" />
            <WidgetSkeleton />
            <WidgetSkeleton className="lg:col-span-2" />
          </div>
        )}

        {/* T081: Main content with responsive grid */}
        {!isLoading && !error && progress && tiers && (
          <div className="space-y-6">
            {/* Hero section: Tier Card + Next Tier Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* T075: VelocityTierCard as hero (2 columns on desktop) */}
              <div className="lg:col-span-2">
                <VelocityTierCard
                  progress={progress}
                  currentTier={currentTier ?? undefined}
                />
              </div>

              {/* T076: NextTierPreview in sidebar */}
              <div>
                <NextTierPreview
                  progress={progress}
                  nextTier={nextTier ?? null}
                  onPlayNowClick={handlePlayNowClick}
                />
              </div>
            </div>

            {/* T077: Tier Journey Progress (full width) */}
            <TierJourneyProgress
              tiers={tiers}
              progress={progress}
              orientation="horizontal"
              onMilestoneClick={handleMilestoneClick}
            />

            {/* Lower section: Missions + Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* T078: Mission Availability Card */}
              <MissionAvailabilityCard
                missions={missions}
                playerTier={progress.currentTier}
                onMissionClick={handleMissionClick}
              />

              {/* T079: XP Activity Feed (2 columns on desktop) */}
              <div className="lg:col-span-2">
                <XPActivityFeed
                  activities={activities}
                  totalCount={activityCount}
                  isLoading={activitiesLoading}
                  hasMore={hasMoreActivities}
                  onLoadMore={loadMoreActivities}
                  filterType={filterType ?? null}
                  onFilterChange={(type) => setFilterType(type ?? undefined)}
                />
              </div>
            </div>

            {/* Benefits section (optional - shown on larger screens) */}
            <div className="hidden xl:block">
              <TierBenefitsList
                tiers={tiers}
                currentTierNumber={progress.currentTier}
                displayMode="full"
              />
            </div>

            {/* Pending level-up indicator */}
            {hasPendingEvents && !levelUpEvent && (
              <div className="fixed bottom-4 right-4 animate-bounce">
                <div className="bg-yellow-500 text-black px-4 py-2 rounded-full font-semibold shadow-lg">
                  🎉 Level Up Pending!
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state - should not happen if progress exists */}
        {!isLoading && !error && !progress && (
          <div className="glass-dark rounded-xl p-12 text-center">
            <span className="text-6xl mb-4 block">🚀</span>
            <h3 className="text-xl font-bold text-white mb-2">
              Welcome to the Velocity Program!
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Start playing to earn XP and climb through the tiers.
              Unlock exclusive rewards and benefits as you progress!
            </p>
          </div>
        )}
      </DashboardLayout>
    </DashboardProvider>
  );
}
