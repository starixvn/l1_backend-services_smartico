/**
 * Mock services for testing dashboard components.
 */

import type {
  Mission,
  Bonus,
  MiniGame,
  Tournament,
  Jackpot,
  Achievement,
  ActivityEvent,
  PersonalGoal,
  CalendarDay,
  StreakData,
  VIPStatus,
  LeaderboardEntry,
  UserCounters,
  LevelData,
} from '../../types/dashboard/data';

/**
 * Mock level data.
 */
export const mockLevelData: LevelData = {
  currentLevel: 42,
  currentXP: 8450,
  xpToNextLevel: 10000,
  xpProgress: 84.5,
};

/**
 * Mock missions.
 */
export const mockMissions: Mission[] = [
  {
    id: 1,
    name: 'Complete 5 trades',
    description: 'Make 5 successful trades today',
    progress: 60,
    targetValue: 5,
    currentValue: 3,
    rewardPoints: 200,
    deadline: new Date(Date.now() + 86400000).toISOString(),
    isCompleted: false,
  },
  {
    id: 2,
    name: 'Win 3 mini games',
    description: 'Win any 3 mini games',
    progress: 33,
    targetValue: 3,
    currentValue: 1,
    rewardPoints: 150,
    deadline: new Date(Date.now() + 86400000).toISOString(),
    isCompleted: false,
  },
];

/**
 * Mock bonuses.
 */
export const mockBonuses: Bonus[] = [
  {
    id: 1,
    name: 'Welcome Bonus',
    description: 'Get +500 points',
    type: 'deposit',
    expiresAt: new Date(Date.now() + 21600000).toISOString(), // 6 hours
    claimed: false,
  },
  {
    id: 2,
    name: 'Daily Bonus',
    description: '50 Free Spins',
    type: 'free-spins',
    expiresAt: new Date(Date.now() + 43200000).toISOString(), // 12 hours
    claimed: true,
  },
];

/**
 * Mock mini games.
 */
export const mockMiniGames: MiniGame[] = [
  {
    id: 1,
    name: 'Spin the Wheel',
    description: 'Spin for prizes!',
    thumbnailUrl: '/images/spin-wheel.png',
    gameType: 'spin-wheel',
    buyInCost: 100,
    jackpotAmount: 5230,
    nextAvailableAt: null,
  },
  {
    id: 2,
    name: 'Gift Box',
    description: 'Choose a mystery gift',
    thumbnailUrl: '/images/gift-box.png',
    gameType: 'gift-box',
    buyInCost: 0,
    jackpotAmount: null,
    nextAvailableAt: null,
  },
];

/**
 * Mock tournament.
 */
export const mockTournament: Tournament = {
  id: 1,
  name: 'Weekend Warriors',
  endsAt: new Date(Date.now() + 172800000).toISOString(), // 2 days
  userRank: 42,
  totalParticipants: 523,
  prizePool: 50000,
};

/**
 * Mock jackpot.
 */
export const mockJackpot: Jackpot = {
  id: 1,
  prizePool: 125450,
  lastWinners: [
    { username: 'J***n', amount: 5000 },
    { username: 'S***h', amount: 3200 },
  ],
  userTickets: 12,
  drawDate: new Date(Date.now() + 259200000).toISOString(), // 3 days
};

/**
 * Mock achievements.
 */
export const mockAchievements: Achievement[] = [
  {
    id: 1,
    name: 'First Win',
    description: 'Win your first game',
    iconUrl: '/images/achievements/first-win.png',
    earnedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    isNew: true,
    rarity: 'common',
  },
  {
    id: 2,
    name: 'Level Master',
    description: 'Reach level 40',
    iconUrl: '/images/achievements/level-master.png',
    earnedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    isNew: false,
    rarity: 'epic',
  },
];

/**
 * Mock activity feed.
 */
export const mockActivityFeed: ActivityEvent[] = [
  {
    id: '1',
    type: 'jackpot-win',
    message: 'J***n won the Mega Jackpot!',
    timestamp: new Date(Date.now() - 120000).toISOString(), // 2 min ago
    iconUrl: '/images/icons/jackpot.png',
  },
  {
    id: '2',
    type: 'level-up',
    message: 'YOU leveled up to 42!',
    timestamp: new Date(Date.now() - 300000).toISOString(), // 5 min ago
  },
];

/**
 * Mock VIP status.
 */
export const mockVIPStatus: VIPStatus = {
  tier: 'gold',
  pointsToNextTier: 5000,
  benefits: ['2x XP', 'Exclusive bonuses', 'Priority support'],
};

/**
 * Mock streak data.
 */
export const mockStreakData: StreakData = {
  currentStreak: 7,
  longestStreak: 30,
  lastLoginDate: new Date().toISOString().split('T')[0],
};

/**
 * Mock leaderboard.
 */
export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'Player_1234', points: 125000, isCurrentUser: false },
  { rank: 2, username: 'Player_5678', points: 98000, isCurrentUser: false },
  { rank: 42, username: 'YOU', points: 45320, isCurrentUser: true },
];

/**
 * Mock user counters.
 */
export const mockCounters: UserCounters = {
  coins: 12500,
  gems: 450,
  diamonds: 89,
  notificationCount: 3,
};

/**
 * Mock personal goals.
 */
export const mockPersonalGoals: PersonalGoal[] = [
  {
    id: '1',
    name: 'Reach level 50',
    targetValue: 50,
    currentValue: 42,
    progress: 84,
    deadline: new Date(Date.now() + 604800000).toISOString(), // 7 days
  },
];

/**
 * Mock reward calendar.
 */
export const mockRewardCalendar: CalendarDay[] = Array.from({ length: 7 }, (_, i) => ({
  date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
  isCompleted: i < 3,
  isToday: i === 3,
  reward: { type: 'points' as const, value: (i + 1) * 10 },
}));
