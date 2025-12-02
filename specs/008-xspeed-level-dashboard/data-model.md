# xSpeed Level Dashboard - Data Model

**Created:** 2025-12-02
**Version:** 1.0.0

## Entity Definitions

### VelocityTier (Static Configuration)

Represents a tier in the xSpeed Velocity Program progression system.

```typescript
/**
 * Velocity Tier configuration - static data from backend configuration
 */
interface VelocityTier {
  /** Tier number (1-4) */
  readonly tierNumber: number;

  /** Display name (Ignition, Cruiser, Turbo, Supersonic) */
  readonly name: string;

  /** XP required to reach this tier */
  readonly xpRequired: number;

  /** Primary benefit unlocked at this tier */
  readonly benefit: string;

  /** Badge rarity for visual styling */
  readonly rarity: 'common' | 'rare' | 'epic' | 'legendary';

  /** Icon/image URL for tier badge */
  readonly iconUrl: string;

  /** Color theme for tier (hex or CSS variable) */
  readonly themeColor: string;

  /** Number of daily missions available at this tier */
  readonly dailyMissionCount: number;

  /** List of specific missions unlocked */
  readonly unlockedMissions: string[];

  /** Additional features unlocked (jackpots, tournaments, etc.) */
  readonly unlockedFeatures: TierFeature[];
}

/**
 * Feature unlocked at a specific tier
 */
interface TierFeature {
  /** Feature type */
  type: 'jackpot' | 'tournament' | 'multiplier' | 'mission';

  /** Feature name */
  name: string;

  /** Feature description */
  description: string;

  /** Value if applicable (e.g., 1.2 for multiplier) */
  value?: number;
}
```

### PlayerVelocityProgress (Dynamic User State)

Represents a player's current progress in the Velocity Program.

```typescript
/**
 * Player's current Velocity Progress - fetched from API
 */
interface PlayerVelocityProgress {
  /** Player's unique identifier */
  readonly userId: string;

  /** Current tier (1-4) */
  currentTier: number;

  /** Current tier name for display */
  currentTierName: string;

  /** Total XP accumulated */
  totalXp: number;

  /** XP threshold for current tier */
  currentTierXpThreshold: number;

  /** XP threshold for next tier (null if max tier) */
  nextTierXpThreshold: number | null;

  /** XP remaining to reach next tier (null if max tier) */
  xpToNextTier: number | null;

  /** Progress percentage within current tier (0-100) */
  progressPercentage: number;

  /** Whether player is at maximum tier */
  isMaxTier: boolean;

  /** Timestamp when current tier was achieved */
  tierAchievedAt: string; // ISO date

  /** XP breakdown by source */
  xpBreakdown: XpBreakdown;
}

/**
 * XP earned by source category
 */
interface XpBreakdown {
  /** XP from slot games */
  slots: number;

  /** XP from table games */
  tableGames: number;

  /** XP from mission completions */
  missions: number;

  /** XP from other sources */
  other: number;
}
```

### XpActivity (Activity Feed Item)

Represents a single XP-earning event.

```typescript
/**
 * XP activity event for the activity feed
 */
interface XpActivity {
  /** Unique activity identifier */
  id: string;

  /** Activity type */
  type: 'slot_play' | 'table_play' | 'mission_complete' | 'bonus' | 'promotion';

  /** Human-readable activity description */
  description: string;

  /** XP earned from this activity */
  xpEarned: number;

  /** Timestamp of activity */
  timestamp: string; // ISO date

  /** Game or mission reference (optional) */
  reference?: {
    type: 'game' | 'mission';
    id: string;
    name: string;
  };
}
```

### MissionAvailability (Tier-Gated Missions)

Represents mission availability based on player tier.

```typescript
/**
 * Mission with tier availability information
 */
interface TierMission {
  /** Mission identifier */
  id: string;

  /** Mission name */
  name: string;

  /** Mission description */
  description: string;

  /** Minimum tier required to access */
  requiredTier: number;

  /** Whether mission is available to current player */
  isAvailable: boolean;

  /** Whether mission is completed today */
  isCompleted: boolean;

  /** XP reward for completion */
  xpReward: number;

  /** Other rewards */
  rewards: MissionReward[];
}

/**
 * Mission reward
 */
interface MissionReward {
  type: 'free_spins' | 'cash' | 'xp_boost' | 'badge';
  value: number;
  description: string;
}
```

### LevelUpEvent (Celebration Trigger)

Represents a tier advancement event.

```typescript
/**
 * Level up event for celebration display
 */
interface LevelUpEvent {
  /** Previous tier number */
  previousTier: number;

  /** Previous tier name */
  previousTierName: string;

  /** New tier number */
  newTier: number;

  /** New tier name */
  newTierName: string;

  /** Timestamp of advancement */
  achievedAt: string; // ISO date

  /** Benefits newly unlocked */
  newBenefits: TierFeature[];

  /** New missions unlocked */
  newMissions: string[];

  /** Has been acknowledged by user */
  acknowledged: boolean;
}
```

## Entity Relationships

```
VelocityTier (1) ←──────── (1) PlayerVelocityProgress.currentTier
     │
     │ contains
     ▼
TierFeature (n)

PlayerVelocityProgress (1) ←───── (n) XpActivity
     │
     │ determines
     ▼
TierMission.isAvailable

PlayerVelocityProgress (1) ──────► (0..1) LevelUpEvent
```

## State Transitions

### Tier Advancement State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────────┐ │
│  │ IGNITION │───►│ CRUISER  │───►│  TURBO   │───►│ SUPERSONIC │ │
│  │  (Tier 1)│    │ (Tier 2) │    │ (Tier 3) │    │  (Tier 4)  │ │
│  │   0 XP   │    │  500 XP  │    │ 5000 XP  │    │ 25000 XP   │ │
│  └──────────┘    └──────────┘    └──────────┘    └────────────┘ │
│       │               │               │               │         │
│       ▼               ▼               ▼               ▼         │
│   1 Mission      2 Missions      3 Missions     3+VIP Missions  │
│   Basic Only     + Explorer      + Tactician    + Whale         │
│                  + Daily Drop    + 1.2x Mult    + Tournaments   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Transition Trigger: totalXp >= nextTierXpThreshold
Transition Effect: LevelUpEvent created, new benefits activated
```

## Validation Rules

### VelocityTier
- `tierNumber` must be 1-4
- `xpRequired` must be non-negative
- `name` must be non-empty
- `dailyMissionCount` must be 1-3

### PlayerVelocityProgress
- `currentTier` must be 1-4
- `totalXp` must be non-negative
- `progressPercentage` must be 0-100
- `xpToNextTier` must be null if `isMaxTier` is true
- `progressPercentage` is 100 if `isMaxTier` is true

### XpActivity
- `xpEarned` must be positive
- `timestamp` must be valid ISO date
- `type` must be valid enum value

### TierMission
- `requiredTier` must be 1-4
- `isAvailable` = playerTier >= requiredTier

## Computed Properties

```typescript
// Derived from PlayerVelocityProgress
const xpInCurrentTier = totalXp - currentTierXpThreshold;
const xpRangeForTier = nextTierXpThreshold - currentTierXpThreshold;
const progressPercentage = isMaxTier
  ? 100
  : Math.floor((xpInCurrentTier / xpRangeForTier) * 100);

// Derived from tier config + player progress
const availableMissions = allMissions.filter(m => m.requiredTier <= currentTier);
const lockedMissions = allMissions.filter(m => m.requiredTier > currentTier);
const nextTierMissions = allMissions.filter(m => m.requiredTier === currentTier + 1);
```

## Static Configuration Data

### Velocity Tier Definitions

| Tier | Name | XP Required | Missions | Key Benefit |
|------|------|-------------|----------|-------------|
| 1 | Ignition | 0 | 1 (Daily Driver) | Access to basic missions |
| 2 | Cruiser | 500 | 2 (+Explorer) | Unlocks Daily Drop Jackpot |
| 3 | Turbo | 5,000 | 3 (+Table Tactician) | 1.2x reward multiplier |
| 4 | Supersonic | 25,000 | 3 + VIP (+Whale) | VIP tournament access |

### XP Earning Rates

| Activity | XP Rate |
|----------|---------|
| Slots | 1 XP per $10 wagered |
| Table Games | 1 XP per $20 wagered |
| Mission Complete | Varies (50-1000 XP) |

---

**Document Status:** Complete
**Version:** 1.0.0
