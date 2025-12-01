/**
 * useDashboardData hook for aggregating data from all gamification services.
 * Fetches data in parallel and updates via SignalR real-time events.
 */

import { useState, useEffect } from 'react';
import type { DashboardData, Mission as DashboardMission, Achievement, Jackpot as DashboardJackpot } from '../types/dashboard/data';
import { api } from '../services/api';
import { JackpotService } from '../services/jackpotService';
import type { Mission, Badge } from '../types';
import type { JackpotDetails, JackPotTemperature } from '../types/jackpot';

/**
 * Loading state for dashboard data.
 */
interface UseDashboardDataState {
  data: DashboardData | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Map backend Mission to Dashboard Mission format.
 */
function mapMissionToDashboard(mission: Mission): DashboardMission {
  // Get first task for target/current value (or aggregate all tasks)
  const firstTask = mission.tasks?.[0];
  const targetValue = firstTask?.targetValue ?? 100;
  const currentValue = firstTask?.currentValue ?? 0;

  return {
    id: mission.id,
    name: mission.name,
    description: mission.description,
    progress: mission.progress,
    targetValue,
    currentValue,
    rewardPoints: mission.rewardAmount ?? 0,
    deadline: mission.expiresAt ?? null,
    isCompleted: mission.progress >= 100,
  };
}

/**
 * Map backend Badge to Dashboard Achievement format.
 */
function mapBadgeToAchievement(badge: Badge): Achievement {
  const rarityMap: Record<string, 'common' | 'rare' | 'epic' | 'legendary'> = {
    'Common': 'common',
    'Rare': 'rare',
    'Epic': 'epic',
    'Legendary': 'legendary',
  };

  return {
    id: badge.id,
    name: badge.name,
    description: badge.description,
    iconUrl: badge.imageUrl ?? '',
    earnedAt: badge.earnedAt ?? new Date().toISOString(),
    isNew: badge.isEarned && badge.earnedAt
      ? (Date.now() - new Date(badge.earnedAt).getTime()) < 24 * 60 * 60 * 1000
      : false,
    rarity: rarityMap[badge.category ?? 'Common'] ?? 'common',
  };
}

/**
 * Map JackPotTemperature enum to dashboard temperature string.
 */
function mapTemperature(temp: JackPotTemperature): 'cold' | 'warm' | 'hot' | 'burning' {
  switch (temp) {
    case 0: return 'cold';
    case 1: return 'warm';
    case 2: return 'hot';
    case 3: return 'burning';
    default: return 'cold';
  }
}

/**
 * Map backend Jackpot to Dashboard Jackpot format.
 */
function mapJackpotToDashboard(jackpot: JackpotDetails): DashboardJackpot {
  return {
    id: jackpot.jpTemplateId,
    name: jackpot.jpPublicMeta?.name ?? 'Jackpot',
    description: jackpot.jpPublicMeta?.description ?? '',
    prizePool: jackpot.pot?.currentPotAmount ?? 0,
    currency: jackpot.jpCurrency ?? 'USD',
    temperature: mapTemperature(jackpot.pot?.currentPotTemperature ?? 0),
    lastWinners: [],
    userTickets: jackpot.registrationCount ?? 0,
    drawDate: jackpot.pot?.exploseDateTs
      ? new Date(jackpot.pot.exploseDateTs).toISOString()
      : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    isOptedIn: jackpot.isOptedIn ?? false,
  };
}

/**
 * Custom hook for dashboard data aggregation.
 * Fetches data from all gamification services in parallel.
 *
 * @returns Dashboard data, loading state, and error
 */
export function useDashboardData(): UseDashboardDataState {
  const [state, setState] = useState<UseDashboardDataState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    const userId = 'demo-user'; // Temporary until JWT authentication

    const fetchDashboardData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Fetch all data in parallel using Promise.all
        const [
          missionsResult,
          badgesResult,
          jackpotsResult,
        ] = await Promise.allSettled([
          api.getMissions(userId),
          api.getBadges(userId),
          JackpotService.getJackpots(userId),
        ]);

        // Extract results with fallbacks
        console.log('📊 Raw results:', { missionsResult, badgesResult, jackpotsResult });

        const missions = missionsResult.status === 'fulfilled' ? missionsResult.value : [];
        const badges = badgesResult.status === 'fulfilled' ? badgesResult.value : [];
        const jackpots = jackpotsResult.status === 'fulfilled' ? jackpotsResult.value : [];

        if (jackpotsResult.status === 'rejected') {
          console.error('❌ Jackpots fetch failed:', jackpotsResult.reason);
        }

        console.log('📊 Dashboard data fetched:', {
          missions: missions.length,
          badges: badges.length,
          jackpots: jackpots.length,
          jackpotsData: jackpots
        });

        // Map to dashboard format
        const dashboardMissions = missions.map(mapMissionToDashboard);
        const dashboardAchievements = badges.map(mapBadgeToAchievement);
        const dashboardJackpots = jackpots.map(mapJackpotToDashboard);

        console.log('🎰 Mapped jackpots:', dashboardJackpots);

        // Build dashboard data with real data + mock data for missing services
        const today = new Date().toISOString().split('T')[0];

        const dashboardData: DashboardData = {
          level: {
            currentLevel: 42,
            currentXP: 8450,
            xpToNextLevel: 10000,
            xpProgress: 84.5,
          },
          missions: dashboardMissions,
          achievements: dashboardAchievements,
          bonuses: [
            {
              id: 1,
              name: 'Welcome Bonus',
              description: 'Get 100% match on your first deposit',
              type: 'deposit',
              expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
              claimed: false,
            },
          ],
          miniGames: [
            {
              id: 1,
              name: 'Wheel of Fortune',
              description: 'Spin the wheel for amazing prizes!',
              thumbnailUrl: '',
              gameType: 'spin-wheel',
              buyInCost: 0,
              jackpotAmount: 10000,
              nextAvailableAt: null,
            },
          ],
          tournament: {
            id: 1,
            name: 'Weekly Championship',
            endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            userRank: 15,
            totalParticipants: 500,
            prizePool: 50000,
          },
          jackpots: dashboardJackpots,
          jackpot: dashboardJackpots[0] ?? null,
          activityFeed: [
            {
              id: '1',
              type: 'level-up',
              message: 'You reached Level 42!',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            },
          ],
          personalGoals: [
            {
              id: '1',
              name: 'Reach Level 50',
              targetValue: 50,
              currentValue: 42,
              progress: 84,
              deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
          rewardCalendar: Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(i + 1);
            const dateStr = date.toISOString().split('T')[0];
            const isToday = dateStr === today;
            const isPast = new Date(dateStr) < new Date(today);

            return {
              date: dateStr,
              isCompleted: isPast,
              isToday,
              reward: {
                type: ['points', 'gems', 'bonus'][i % 3] as 'points' | 'gems' | 'bonus',
                value: (i + 1) * 10,
              },
            };
          }),
          streakData: {
            currentStreak: 12,
            longestStreak: 30,
            lastLoginDate: today,
          },
          vipStatus: {
            tier: 'gold',
            pointsToNextTier: 5000,
            benefits: ['2x XP Boost', 'Exclusive Bonuses', 'Priority Support', 'Monthly Rewards'],
          },
          leaderboard: Array.from({ length: 10 }, (_, i) => ({
            rank: i + 1,
            username: i === 4 ? 'You' : `Player_${Math.floor(Math.random() * 9999)}`,
            points: 50000 - i * 5000,
            isCurrentUser: i === 4,
          })),
          counters: {
            coins: 12500,
            gems: 450,
            diamonds: 89,
            notificationCount: 3,
          },
        };

        if (isMounted) {
          setState({
            data: dashboardData,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('❌ Failed to fetch dashboard data:', error);
        if (isMounted) {
          setState({
            data: null,
            isLoading: false,
            error: error instanceof Error ? error : new Error('Failed to fetch dashboard data'),
          });
        }
      }
    };

    fetchDashboardData();

    // TODO: Set up SignalR event listeners for real-time updates
    // signalrService.on('mission-progress', handleMissionProgress);
    // signalrService.on('level-up', handleLevelUp);
    // signalrService.on('achievement-earned', handleAchievementEarned);
    // etc.

    return () => {
      isMounted = false;
      // TODO: Clean up SignalR listeners
    };
  }, []);

  return state;
}

/**
 * Refresh dashboard data (force refetch).
 * TODO: Implement when integrating with actual services.
 */
export function useRefreshDashboard() {
  const refresh = async () => {
    // TODO: Implement refresh logic
    console.log('Refreshing dashboard data...');
  };

  return refresh;
}
