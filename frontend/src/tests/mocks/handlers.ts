/**
 * Mock Service Worker (MSW) request handlers for testing.
 * Intercepts HTTP requests and returns mock data.
 */

import { http, HttpResponse } from 'msw';
import {
  mockMissions,
  mockBonuses,
  mockMiniGames,
  mockTournament,
  mockJackpot,
  mockAchievements,
  mockActivityFeed,
  mockVIPStatus,
  mockStreakData,
  mockLeaderboard,
  mockCounters,
  mockLevelData,
  mockPersonalGoals,
  mockRewardCalendar,
} from './services';

/**
 * API request handlers for all gamification endpoints.
 */
export const handlers = [
  // Level/XP API
  http.get('/api/level', () => {
    return HttpResponse.json(mockLevelData);
  }),

  // Missions API
  http.get('/api/missions', () => {
    return HttpResponse.json(mockMissions);
  }),

  http.post('/api/missions/:id/claim', ({ params }: { params: { id: string } }) => {
    const missionId = Number(params.id);
    const mission = mockMissions.find((m) => m.id === missionId);

    if (!mission) {
      return new HttpResponse(null, { status: 404 });
    }

    if (!mission.isCompleted) {
      return new HttpResponse(
        JSON.stringify({ error: 'Mission not completed' }),
        { status: 400 }
      );
    }

    return HttpResponse.json({ success: true, pointsAwarded: mission.rewardPoints });
  }),

  // Bonuses API
  http.get('/api/bonuses', () => {
    return HttpResponse.json(mockBonuses);
  }),

  http.post('/api/bonuses/:id/claim', ({ params }: { params: { id: string } }) => {
    const bonusId = Number(params.id);
    const bonus = mockBonuses.find((b) => b.id === bonusId);

    if (!bonus) {
      return new HttpResponse(null, { status: 404 });
    }

    if (bonus.claimed) {
      return new HttpResponse(
        JSON.stringify({ error: 'Bonus already claimed' }),
        { status: 400 }
      );
    }

    return HttpResponse.json({ success: true });
  }),

  // Mini Games API
  http.get('/api/mini-games', () => {
    return HttpResponse.json(mockMiniGames);
  }),

  http.post('/api/mini-games/:id/play', ({ params }: { params: { id: string } }) => {
    const gameId = Number(params.id);
    const game = mockMiniGames.find((g) => g.id === gameId);

    if (!game) {
      return new HttpResponse(null, { status: 404 });
    }

    // Simulate random prize win
    const prizes = ['points', 'bonus', 'no-prize'];
    const prize = prizes[Math.floor(Math.random() * prizes.length)];

    return HttpResponse.json({
      success: true,
      prize: prize === 'no-prize' ? null : { type: prize, value: 100 },
    });
  }),

  // Tournament API
  http.get('/api/tournament', () => {
    return HttpResponse.json(mockTournament);
  }),

  // Jackpot API
  http.get('/api/jackpot', () => {
    return HttpResponse.json(mockJackpot);
  }),

  // Achievements API
  http.get('/api/achievements', () => {
    return HttpResponse.json(mockAchievements);
  }),

  // Activity Feed API
  http.get('/api/activity', () => {
    return HttpResponse.json(mockActivityFeed);
  }),

  // VIP Status API
  http.get('/api/vip-status', () => {
    return HttpResponse.json(mockVIPStatus);
  }),

  // Streak Data API
  http.get('/api/streak', () => {
    return HttpResponse.json(mockStreakData);
  }),

  // Leaderboard API
  http.get('/api/leaderboard', () => {
    return HttpResponse.json(mockLeaderboard);
  }),

  // User Counters API
  http.get('/api/counters', () => {
    return HttpResponse.json(mockCounters);
  }),

  // Personal Goals API
  http.get('/api/personal-goals', () => {
    return HttpResponse.json(mockPersonalGoals);
  }),

  // Reward Calendar API
  http.get('/api/reward-calendar', () => {
    return HttpResponse.json(mockRewardCalendar);
  }),

  http.post('/api/reward-calendar/:date/claim', ({ params }: { params: { date: string } }) => {
    const dateStr = params.date;
    const day = mockRewardCalendar.find((d) => d.date === dateStr);

    if (!day) {
      return new HttpResponse(null, { status: 404 });
    }

    if (!day.isToday) {
      return new HttpResponse(
        JSON.stringify({ error: 'Can only claim today\'s reward' }),
        { status: 400 }
      );
    }

    if (day.isCompleted) {
      return new HttpResponse(
        JSON.stringify({ error: 'Reward already claimed' }),
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      reward: day.reward,
    });
  }),
];
