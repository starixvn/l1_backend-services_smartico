/**
 * Dashboard data types for the Gamification Dashboard.
 * Aggregated data from multiple gamification services.
 */

/**
 * User level and experience data.
 */
export interface LevelData {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  xpProgress: number; // Percentage (0-100)
}

/**
 * Mission entity (from existing missions service).
 */
export interface Mission {
  id: number;
  name: string;
  description: string;
  progress: number; // Percentage (0-100)
  targetValue: number;
  currentValue: number;
  rewardPoints: number;
  deadline: string | null; // ISO 8601 date
  isCompleted: boolean;
}

/**
 * Achievement entity (from existing achievements service).
 */
export interface Achievement {
  id: number;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: string; // ISO 8601 date
  isNew: boolean; // True if earned within last 24 hours
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

/**
 * Bonus offer entity (from existing bonuses service).
 */
export interface Bonus {
  id: number;
  name: string;
  description: string;
  type: 'deposit' | 'cashback' | 'free-spins' | 'loyalty';
  expiresAt: string; // ISO 8601 date
  claimed: boolean;
}

/**
 * Mini game entity (from existing miniGame service).
 */
export interface MiniGame {
  id: number;
  name: string;
  description: string;
  thumbnailUrl: string;
  gameType: 'spin-wheel' | 'gift-box' | 'scratch-card' | 'match-x';
  buyInCost: number; // Points/gems/diamonds or 0 for free
  jackpotAmount: number | null;
  nextAvailableAt: string | null; // ISO 8601 date for cooldown
}

/**
 * Tournament entity (from existing tournament service).
 */
export interface Tournament {
  id: number;
  name: string;
  endsAt: string; // ISO 8601 date
  userRank: number;
  totalParticipants: number;
  prizePool: number;
}

/**
 * Jackpot entity (from existing jackpot service).
 */
export interface Jackpot {
  id: number;
  prizePool: number;
  lastWinners: { username: string; amount: number }[];
  userTickets: number;
  drawDate: string; // ISO 8601 date
}

/**
 * Activity feed event.
 */
export interface ActivityEvent {
  id: string;
  type: 'level-up' | 'mission-complete' | 'achievement' | 'bonus-claim' | 'tournament-win' | 'jackpot-win';
  message: string;
  timestamp: string; // ISO 8601 date
  iconUrl?: string;
}

/**
 * Personal goal entity.
 */
export interface PersonalGoal {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  progress: number; // Percentage (0-100)
  deadline: string | null; // ISO 8601 date
}

/**
 * Calendar day for reward calendar.
 */
export interface CalendarDay {
  date: string; // YYYY-MM-DD
  isCompleted: boolean;
  isToday: boolean;
  reward: { type: 'points' | 'gems' | 'bonus'; value: number } | null;
}

/**
 * Streak data.
 */
export interface StreakData {
  currentStreak: number; // Days
  longestStreak: number; // Days
  lastLoginDate: string; // YYYY-MM-DD
}

/**
 * VIP status information.
 */
export interface VIPStatus {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  pointsToNextTier: number;
  benefits: string[];
}

/**
 * Leaderboard entry.
 */
export interface LeaderboardEntry {
  rank: number;
  username: string; // Anonymized (e.g., "Player_1234")
  points: number;
  isCurrentUser: boolean;
}

/**
 * User counters (coins, gems, diamonds).
 */
export interface UserCounters {
  coins: number;
  gems: number;
  diamonds: number;
  notificationCount: number;
}

/**
 * Aggregated dashboard data from all gamification services.
 * Loaded on mount and updated via SignalR real-time events.
 */
export interface DashboardData {
  /** User level and XP data */
  level: LevelData;

  /** Active missions (in-progress, not completed) */
  missions: Mission[];

  /** Recently earned achievements (last 5) */
  achievements: Achievement[];

  /** Active bonus offers */
  bonuses: Bonus[];

  /** Available mini games */
  miniGames: MiniGame[];

  /** Active tournament with user's rank */
  tournament: Tournament | null;

  /** Jackpot prize pool and user's status */
  jackpot: Jackpot | null;

  /** Recent activity feed events (last 10) */
  activityFeed: ActivityEvent[];

  /** User's personal goals */
  personalGoals: PersonalGoal[];

  /** Daily login calendar data */
  rewardCalendar: CalendarDay[];

  /** Current streak count */
  streakData: StreakData;

  /** VIP tier information */
  vipStatus: VIPStatus;

  /** Leaderboard rankings */
  leaderboard: LeaderboardEntry[];

  /** User counters (coins, gems, diamonds) */
  counters: UserCounters;
}
