/**
 * useDashboardData hook for aggregating data from all gamification services.
 * Fetches data in parallel and updates via SignalR real-time events.
 */

import { useState, useEffect } from 'react';
import type { DashboardData } from '../types/dashboard/data';

/**
 * Loading state for dashboard data.
 */
interface UseDashboardDataState {
  data: DashboardData | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook for dashboard data aggregation.
 * Fetches data from all gamification services in parallel.
 *
 * TODO: Integrate with existing services:
 * - missionService.getMissions()
 * - bonusService.getBonuses()
 * - miniGameService.getMiniGames()
 * - tournamentService.getTournament()
 * - levelService.getLevel()
 * - jackpotService.getJackpot()
 * - achievementService.getAchievements()
 * - activityService.getActivity()
 * - vipService.getVIPStatus()
 * - streakService.getStreak()
 * - leaderboardService.getLeaderboard()
 * - signalrService for real-time updates
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

    const fetchDashboardData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // TODO: Replace with actual service calls
        // Fetch all data in parallel using Promise.all
        const [
          // missions,
          // bonuses,
          // miniGames,
          // tournament,
          // level,
          // jackpot,
          // achievements,
          // activityFeed,
          // vipStatus,
          // streakData,
          // leaderboard,
          // counters,
        ] = await Promise.all([
          // missionService.getMissions(),
          // bonusService.getBonuses(),
          // miniGameService.getMiniGames(),
          // tournamentService.getTournament(),
          // levelService.getLevel(),
          // jackpotService.getJackpot(),
          // achievementService.getAchievements(),
          // activityService.getActivityFeed(),
          // vipService.getVIPStatus(),
          // streakService.getStreak(),
          // leaderboardService.getLeaderboard(),
          // userService.getCounters(),
        ]);

        // Mock data for now (replace with actual data)
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const mockData: DashboardData = {
          level: {
            currentLevel: 42,
            currentXP: 8450,
            xpToNextLevel: 10000,
            xpProgress: 84.5,
          },
          missions: [
            {
              id: 1,
              name: 'Win 10 Games',
              description: 'Play and win 10 games today',
              progress: 70,
              targetValue: 10,
              currentValue: 7,
              rewardPoints: 500,
              deadline: tomorrow,
              isCompleted: false,
            },
            {
              id: 2,
              name: 'Complete 5 Missions',
              description: 'Finish any 5 missions',
              progress: 100,
              targetValue: 5,
              currentValue: 5,
              rewardPoints: 300,
              deadline: null,
              isCompleted: true,
            },
          ],
          achievements: [
            {
              id: 1,
              name: 'First Win',
              description: 'Win your first game',
              iconUrl: '',
              earnedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              isNew: true,
              rarity: 'rare',
            },
            {
              id: 2,
              name: 'Level Master',
              description: 'Reach level 40',
              iconUrl: '',
              earnedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
              isNew: false,
              rarity: 'epic',
            },
          ],
          bonuses: [
            {
              id: 1,
              name: 'Welcome Bonus',
              description: 'Get 100% match on your first deposit',
              type: 'deposit',
              expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
              claimed: false,
            },
            {
              id: 2,
              name: 'Free Spins',
              description: '50 free spins on selected games',
              type: 'free-spins',
              expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
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
            {
              id: 2,
              name: 'Mystery Box',
              description: 'Open a box to reveal your reward',
              thumbnailUrl: '',
              gameType: 'gift-box',
              buyInCost: 100,
              jackpotAmount: null,
              nextAvailableAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
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
          jackpot: {
            id: 1,
            prizePool: 125000,
            lastWinners: [
              { username: 'Player_1234', amount: 50000 },
              { username: 'WinnerPro', amount: 30000 },
              { username: 'LuckyOne', amount: 25000 },
            ],
            userTickets: 5,
            drawDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          activityFeed: [
            {
              id: '1',
              type: 'level-up',
              message: 'You reached Level 42!',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            },
            {
              id: '2',
              type: 'achievement',
              message: 'Achievement unlocked: First Win',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: '3',
              type: 'mission-complete',
              message: 'Mission completed: Complete 5 Missions',
              timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
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
            {
              id: '2',
              name: 'Earn 10,000 Points',
              targetValue: 10000,
              currentValue: 7500,
              progress: 75,
              deadline: null,
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
            data: mockData,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
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
      // signalrService.off('mission-progress', handleMissionProgress);
      // etc.
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
