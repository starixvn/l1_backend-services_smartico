# Gamification Widget Layout - Data Model

**Version:** 1.0.0
**Created:** 2025-11-12
**Status:** Draft

## Core Entities

### ThemeConfig

User's theme preferences for the dashboard appearance.

```typescript
/**
 * User theme configuration for dashboard customization.
 * Persisted to localStorage as 'smartico-theme-config'.
 */
interface ThemeConfig {
  /** Theme mode: light or dark */
  mode: 'light' | 'dark';

  /** Selected theme preset */
  preset: 'royal-purple' | 'ocean-blue' | 'neon-cyber' | 'nature-zen' | 'sunset-orange' | 'custom';

  /** Custom primary color (hex) - only used when preset is 'custom' */
  primaryColor?: string;

  /** Custom accent color (hex) - only used when preset is 'custom' */
  accentColor?: string;

  /** Base font size in pixels */
  fontSize: 14 | 16 | 18;

  /** Animation intensity level */
  animationIntensity: 'none' | 'subtle' | 'moderate' | 'full';
}

/**
 * Default theme configuration (Royal Purple Dark Glassmorphism).
 */
const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: 'dark',
  preset: 'royal-purple',
  fontSize: 16,
  animationIntensity: 'moderate'
};
```

### WidgetLayoutConfig

User's widget layout preferences including order, visibility, and size.

```typescript
/**
 * Widget layout configuration for drag-and-drop customization.
 * Persisted to localStorage as 'smartico-widget-layout'.
 */
interface WidgetLayoutConfig {
  /** Ordered array of widget IDs representing grid position */
  order: WidgetId[];

  /** Visibility map for each widget */
  visibility: Record<WidgetId, boolean>;

  /** Size mode for each widget (affects grid column span) */
  sizeMode: Record<WidgetId, 'compact' | 'expanded'>;
}

/**
 * Widget identifiers for all 14 widgets.
 */
type WidgetId =
  | 'daily-challenge'
  | 'level-progress'
  | 'active-missions'
  | 'recent-achievements'
  | 'leaderboard'
  | 'bonus-tracker'
  | 'mini-games'
  | 'tournament'
  | 'jackpot'
  | 'activity-feed'
  | 'personal-goals'
  | 'reward-calendar'
  | 'streak-tracker'
  | 'vip-status';

/**
 * Default widget layout (all visible, standard order, expanded mode).
 */
const DEFAULT_WIDGET_LAYOUT: WidgetLayoutConfig = {
  order: [
    'daily-challenge',
    'level-progress',
    'active-missions',
    'recent-achievements',
    'leaderboard',
    'bonus-tracker',
    'mini-games',
    'tournament',
    'jackpot',
    'activity-feed',
    'personal-goals',
    'reward-calendar',
    'streak-tracker',
    'vip-status'
  ],
  visibility: {
    'daily-challenge': true,
    'level-progress': true,
    'active-missions': true,
    'recent-achievements': true,
    'leaderboard': true,
    'bonus-tracker': true,
    'mini-games': true,
    'tournament': true,
    'jackpot': true,
    'activity-feed': true,
    'personal-goals': true,
    'reward-calendar': true,
    'streak-tracker': true,
    'vip-status': true
  },
  sizeMode: {
    'daily-challenge': 'expanded',
    'level-progress': 'expanded',
    'active-missions': 'expanded',
    'recent-achievements': 'expanded',
    'leaderboard': 'expanded',
    'bonus-tracker': 'expanded',
    'mini-games': 'expanded',
    'tournament': 'expanded',
    'jackpot': 'expanded',
    'activity-feed': 'expanded',
    'personal-goals': 'expanded',
    'reward-calendar': 'expanded',
    'streak-tracker': 'expanded',
    'vip-status': 'expanded'
  }
};
```

### DashboardData

Aggregated data from multiple gamification services for dashboard display.

```typescript
/**
 * Aggregated dashboard data from all gamification services.
 * Loaded on mount and updated via SignalR real-time events.
 */
interface DashboardData {
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
```

### Supporting Types

```typescript
/**
 * User level and experience data.
 */
interface LevelData {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  xpProgress: number; // Percentage (0-100)
}

/**
 * Mission entity (from existing missions service).
 */
interface Mission {
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
interface Achievement {
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
interface Bonus {
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
interface MiniGame {
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
interface Tournament {
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
interface Jackpot {
  id: number;
  prizePool: number;
  lastWinners: { username: string; amount: number }[];
  userTickets: number;
  drawDate: string; // ISO 8601 date
}

/**
 * Activity feed event.
 */
interface ActivityEvent {
  id: string;
  type: 'level-up' | 'mission-complete' | 'achievement' | 'bonus-claim' | 'tournament-win';
  message: string;
  timestamp: string; // ISO 8601 date
  iconUrl?: string;
}

/**
 * Personal goal entity.
 */
interface PersonalGoal {
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
interface CalendarDay {
  date: string; // YYYY-MM-DD
  isCompleted: boolean;
  isToday: boolean;
  reward: { type: 'points' | 'gems' | 'bonus'; value: number } | null;
}

/**
 * Streak data.
 */
interface StreakData {
  currentStreak: number; // Days
  longestStreak: number; // Days
  lastLoginDate: string; // YYYY-MM-DD
}

/**
 * VIP status information.
 */
interface VIPStatus {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  pointsToNextTier: number;
  benefits: string[];
}

/**
 * Leaderboard entry.
 */
interface LeaderboardEntry {
  rank: number;
  username: string; // Anonymized (e.g., "Player_1234")
  points: number;
  isCurrentUser: boolean;
}

/**
 * User counters (coins, gems, diamonds).
 */
interface UserCounters {
  coins: number;
  gems: number;
  diamonds: number;
  notificationCount: number;
}
```

## Theme Presets

```typescript
/**
 * Predefined theme presets with color configurations.
 */
interface ThemePreset {
  id: ThemeConfig['preset'];
  name: string;
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
  gradient: string; // TailwindCSS gradient class
  glassmorphism: string; // TailwindCSS glassmorphism classes
  borderColor: string; // TailwindCSS border color
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'royal-purple',
    name: 'Royal Purple (Dark Glassmorphism)',
    mode: 'dark',
    primaryColor: '#9333EA', // purple-600
    accentColor: '#EC4899', // pink-500
    gradient: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
    glassmorphism: 'bg-slate-800/50 backdrop-blur-lg',
    borderColor: 'border-purple-500/30'
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue (Light)',
    mode: 'light',
    primaryColor: '#0077BE',
    accentColor: '#00B4D8',
    gradient: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100',
    glassmorphism: 'bg-white/70 backdrop-blur-lg',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    mode: 'dark',
    primaryColor: '#00F0FF',
    accentColor: '#FF00F0',
    gradient: 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900',
    glassmorphism: 'bg-gray-800/50 backdrop-blur-lg',
    borderColor: 'border-cyan-500/30'
  },
  {
    id: 'nature-zen',
    name: 'Nature Zen',
    mode: 'light',
    primaryColor: '#2D5016',
    accentColor: '#A8E6CF',
    gradient: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
    glassmorphism: 'bg-white/70 backdrop-blur-lg',
    borderColor: 'border-green-500/30'
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    mode: 'dark',
    primaryColor: '#FF6B35',
    accentColor: '#F7931E',
    gradient: 'bg-gradient-to-br from-orange-900 via-red-900 to-yellow-900',
    glassmorphism: 'bg-orange-800/50 backdrop-blur-lg',
    borderColor: 'border-orange-500/30'
  }
];
```

## LocalStorage Schema

```typescript
/**
 * LocalStorage keys used by the dashboard.
 */
const STORAGE_KEYS = {
  THEME_CONFIG: 'smartico-theme-config',
  WIDGET_LAYOUT: 'smartico-widget-layout',
  ANIMATION_PREFERENCES: 'smartico-animation-prefs',
  SIDEBAR_COLLAPSED: 'smartico-sidebar-collapsed'
} as const;

/**
 * Animation preferences stored in localStorage.
 */
interface AnimationPreferences {
  reducedMotion: boolean; // Overrides system prefers-reduced-motion
  particleEffects: boolean;
  celebrationAnimations: boolean;
}
```

## SignalR Event Types

```typescript
/**
 * SignalR event types for real-time dashboard updates.
 * These events are broadcast via the existing /hubs/progress hub.
 */
type SignalREvent =
  | { type: 'level-up'; data: { newLevel: number; xpGained: number } }
  | { type: 'mission-progress'; data: { missionId: number; progress: number } }
  | { type: 'mission-complete'; data: { missionId: number; rewardPoints: number } }
  | { type: 'achievement-earned'; data: Achievement }
  | { type: 'bonus-claimed'; data: { bonusId: number } }
  | { type: 'jackpot-update'; data: { newPrizePool: number } }
  | { type: 'tournament-rank-change'; data: { newRank: number } }
  | { type: 'counter-update'; data: Partial<UserCounters> };
```

## Validation Rules

### ThemeConfig Validation

```typescript
/**
 * Validates theme configuration before saving to localStorage.
 * @throws {ValidationError} If validation fails
 */
function validateThemeConfig(config: unknown): asserts config is ThemeConfig {
  if (!config || typeof config !== 'object') {
    throw new ValidationError('Theme config must be an object');
  }

  const c = config as Partial<ThemeConfig>;

  if (!['light', 'dark'].includes(c.mode!)) {
    throw new ValidationError('Invalid theme mode');
  }

  const validPresets = ['royal-purple', 'ocean-blue', 'neon-cyber', 'nature-zen', 'sunset-orange', 'custom'];
  if (!validPresets.includes(c.preset!)) {
    throw new ValidationError('Invalid theme preset');
  }

  if (c.preset === 'custom') {
    if (!c.primaryColor || !c.accentColor) {
      throw new ValidationError('Custom preset requires primaryColor and accentColor');
    }
    if (!/^#[0-9A-F]{6}$/i.test(c.primaryColor) || !/^#[0-9A-F]{6}$/i.test(c.accentColor)) {
      throw new ValidationError('Invalid hex color format');
    }
  }

  if (![14, 16, 18].includes(c.fontSize!)) {
    throw new ValidationError('Invalid font size');
  }

  if (!['none', 'subtle', 'moderate', 'full'].includes(c.animationIntensity!)) {
    throw new ValidationError('Invalid animation intensity');
  }
}
```

### WidgetLayoutConfig Validation

```typescript
/**
 * Validates widget layout configuration before saving to localStorage.
 * @throws {ValidationError} If validation fails
 */
function validateWidgetLayoutConfig(config: unknown): asserts config is WidgetLayoutConfig {
  if (!config || typeof config !== 'object') {
    throw new ValidationError('Widget layout config must be an object');
  }

  const c = config as Partial<WidgetLayoutConfig>;

  if (!Array.isArray(c.order) || c.order.length > 20) {
    throw new ValidationError('Order must be an array with max 20 widgets');
  }

  const validWidgetIds: WidgetId[] = [
    'daily-challenge', 'level-progress', 'active-missions', 'recent-achievements',
    'leaderboard', 'bonus-tracker', 'mini-games', 'tournament', 'jackpot',
    'activity-feed', 'personal-goals', 'reward-calendar', 'streak-tracker', 'vip-status'
  ];

  for (const id of c.order) {
    if (!validWidgetIds.includes(id as WidgetId)) {
      throw new ValidationError(`Invalid widget ID: ${id}`);
    }
  }

  if (typeof c.visibility !== 'object') {
    throw new ValidationError('Visibility must be an object');
  }

  if (typeof c.sizeMode !== 'object') {
    throw new ValidationError('SizeMode must be an object');
  }

  for (const mode of Object.values(c.sizeMode)) {
    if (!['compact', 'expanded'].includes(mode as string)) {
      throw new ValidationError('Invalid size mode');
    }
  }
}
```

## Notes

- All interfaces use `readonly` for immutable properties where applicable
- All date/time values use ISO 8601 format for consistency
- Color values use hex format (#RRGGBB) for custom themes
- Percentages are stored as integers (0-100) not decimals
- No PII (personally identifiable information) is stored in localStorage
- Usernames in leaderboard/activity feed are anonymized
