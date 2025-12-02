# xSpeed Demo Journey - Data Model

## Overview

This document defines the data structures for the xSpeed Demo Journey feature. The implementation extends existing entities (Mission, Jackpot, Badge) with xSpeed-specific configurations.

---

## Entity Definitions

### XSpeedScenario

**Purpose**: Represents an xSpeed demo scenario definition.

**Source**: Extends `DemoScenarioDto`

| Field | Type | Description |
|-------|------|-------------|
| `Id` | `string` | Unique scenario ID (e.g., "xspeed-velocity-program") |
| `Name` | `string` | Display name |
| `Description` | `string` | Scenario description |
| `Category` | `string` | Always "Complete" for xSpeed |
| `Entities` | `List<string>` | List of entity types created |
| `ExpectedOutcome` | `string` | Business outcome description |
| `Phase` | `int?` | Phase number (1, 2, 3) or null for complete |

**xSpeed Scenarios**:
```json
[
  {
    "id": "xspeed-velocity-program",
    "name": "xSpeed Velocity Program (Complete)",
    "category": "Complete",
    "phase": null,
    "entities": [
      "4 Velocity Tier Badges",
      "4 Level-Gated Missions",
      "3 xSpeed Mystery Drop Jackpots"
    ]
  },
  {
    "id": "xspeed-phase-1",
    "name": "xSpeed Phase 1 (Soft Launch)",
    "category": "Complete",
    "phase": 1,
    "entities": ["Tiers 1-2", "Daily Driver Mission", "2 Badges"]
  },
  {
    "id": "xspeed-phase-2",
    "name": "xSpeed Phase 2 (Expansion)",
    "category": "Complete",
    "phase": 2,
    "entities": ["All Tiers", "Table Missions", "Hourly Jackpot"]
  },
  {
    "id": "xspeed-phase-3",
    "name": "xSpeed Phase 3 (Full Velocity)",
    "category": "Complete",
    "phase": 3,
    "entities": ["All Missions", "All Jackpots", "Cross-sell"]
  }
]
```

---

### VelocityTierConfiguration

**Purpose**: Defines the 4 Velocity Tier levels for xSpeed.

| Field | Type | Description |
|-------|------|-------------|
| `TierNumber` | `int` | 1-4 |
| `Name` | `string` | Ignition, Cruiser, Turbo, Supersonic |
| `XpRequired` | `int` | XP threshold to reach tier |
| `Benefit` | `string` | Tier benefit description |
| `RiskControl` | `string` | Risk control setting |
| `UnlockedFeatures` | `List<string>` | Features unlocked at this tier |

**Velocity Tiers**:
```csharp
public static readonly VelocityTier[] Tiers = new[]
{
    new VelocityTier
    {
        TierNumber = 1,
        Name = "Ignition",
        XpRequired = 0,
        Benefit = "Access to Basic Missions",
        RiskControl = "Cap rewards at $5 total value",
        UnlockedFeatures = new[] { "Daily Driver Mission" }
    },
    new VelocityTier
    {
        TierNumber = 2,
        Name = "Cruiser",
        XpRequired = 500,
        Benefit = "Unlocks Daily Drop Jackpot",
        RiskControl = "Must have deposited once",
        UnlockedFeatures = new[] { "Explorer Mission", "Hourly Jackpot" }
    },
    new VelocityTier
    {
        TierNumber = 3,
        Name = "Turbo",
        XpRequired = 5000,
        Benefit = "1.2x Multiplier on Mission Rewards",
        RiskControl = "Flag accounts reaching in <24h",
        UnlockedFeatures = new[] { "Table Tactician Mission" }
    },
    new VelocityTier
    {
        TierNumber = 4,
        Name = "Supersonic",
        XpRequired = 25000,
        Benefit = "Private VIP Tournament Access",
        RiskControl = "Manual Withdrawal Review enabled",
        UnlockedFeatures = new[] { "Whale Challenge", "VIP Tournaments" }
    }
};
```

---

### XSpeedMissionConfiguration

**Purpose**: Defines xSpeed mission templates.

| Field | Type | Description |
|-------|------|-------------|
| `Id` | `string` | Mission identifier |
| `Name` | `string` | Mission name |
| `Description` | `string` | Mission description |
| `RequiredLevel` | `int` | Minimum level required |
| `Tasks` | `List<MissionTaskDto>` | Task definitions |
| `CompletionXp` | `int` | XP reward |
| `Reward` | `string` | Reward description |
| `RiskControl` | `string` | Risk control setting |

**xSpeed Missions**:

#### Daily Driver (Level 1+)
```json
{
  "id": "xspeed-daily-driver",
  "name": "The Daily Driver",
  "description": "Your daily habit-building slot challenge",
  "requiredLevel": 1,
  "tasks": [
    {
      "name": "Login Today",
      "description": "Login to the platform",
      "trigger": { "type": "DailyLogin" },
      "goal": { "type": "LoginCount", "targetCount": 1 }
    },
    {
      "name": "Spin the Reels",
      "description": "Wager $50 on any Slot",
      "trigger": { "type": "BetPlaced" },
      "goal": { "type": "WageredAmount", "targetAmount": 50 }
    }
  ],
  "completionXp": 100,
  "reward": "10 Free Spins",
  "riskControl": "1 Claim per 24h, min spin duration 2s"
}
```

#### Explorer (Level 2+)
```json
{
  "id": "xspeed-explorer",
  "name": "The Explorer",
  "description": "Try new game categories for XP boost!",
  "requiredLevel": 2,
  "tasks": [
    {
      "name": "Try Keno or Lottery",
      "description": "Play 5 rounds of Keno or Lottery",
      "trigger": { "type": "GamePlayed", "eligibleGames": ["keno", "lottery"] },
      "goal": { "type": "BetCount", "targetCount": 5 }
    }
  ],
  "completionXp": 50,
  "reward": "Explorer Badge",
  "riskControl": "Cross-sell promotion"
}
```

#### Table Tactician (Level 3+)
```json
{
  "id": "xspeed-table-tactician",
  "name": "The Table Tactician",
  "description": "Master the tables for cash rewards",
  "requiredLevel": 3,
  "tasks": [
    {
      "name": "Win Streak",
      "description": "Win 5 hands of Blackjack or Baccarat in a row",
      "trigger": {
        "type": "BetPlaced",
        "minAmount": 2,
        "eligibleGames": ["blackjack", "baccarat"]
      },
      "goal": { "type": "WinStreak", "targetCount": 5 }
    }
  ],
  "completionXp": 250,
  "reward": "$10 Cash Credit",
  "riskControl": "Min bet $2, flag >80% win rate"
}
```

#### Whale Challenge (Level 4+)
```json
{
  "id": "xspeed-whale-challenge",
  "name": "The Whale Challenge",
  "description": "Weekly VIP high-stakes challenge",
  "requiredLevel": 4,
  "tasks": [
    {
      "name": "High Volume",
      "description": "Wager $5,000 total this week",
      "trigger": { "type": "BetPlaced" },
      "goal": { "type": "WageredAmount", "targetAmount": 5000 }
    }
  ],
  "completionXp": 1000,
  "reward": "VIP Bonus Package",
  "riskControl": "VIP segment only, weekly reset"
}
```

---

### XSpeedJackpotConfiguration

**Purpose**: Defines xSpeed Mystery Drop jackpot templates.

| Field | Type | Description |
|-------|------|-------------|
| `Id` | `string` | Jackpot identifier |
| `Name` | `string` | Jackpot name |
| `Description` | `string` | Jackpot description |
| `TriggerType` | `JackpotTriggerType` | How jackpot triggers |
| `TriggerConfig` | `object` | Trigger-specific configuration |
| `SeedAmount` | `decimal` | Starting pool amount |
| `ContributionRate` | `decimal` | Contribution percentage |
| `RiskControl` | `string` | Risk control setting |

**xSpeed Jackpots**:

#### Hourly Prize Drop
```json
{
  "id": "xspeed-hourly-drop",
  "name": "Hourly Prize Drop",
  "description": "Surprise drop every 60 minutes!",
  "triggerType": "TimeBased",
  "triggerConfig": {
    "timeInterval": "Hourly"
  },
  "tiers": [
    {
      "name": "Hourly Drop",
      "seedAmount": 50,
      "contributionRate": 0.001
    }
  ],
  "riskControl": "Must wager >$10 in last 15 mins to qualify"
}
```

#### Daily Pot
```json
{
  "id": "xspeed-daily-pot",
  "name": "Daily Pot",
  "description": "Prime-time jackpot drop 8-10 PM!",
  "triggerType": "TimeBased",
  "triggerConfig": {
    "timeInterval": "Daily",
    "timeOfDay": "20:00"
  },
  "tiers": [
    {
      "name": "Daily Grand",
      "seedAmount": 500,
      "contributionRate": 0.002
    }
  ],
  "riskControl": "RNG review required"
}
```

#### Mega Pot
```json
{
  "id": "xspeed-mega-pot",
  "name": "Mega Pot",
  "description": "The life-changing jackpot - drops at $50,000!",
  "triggerType": "AmountBased",
  "triggerConfig": {
    "triggerAmount": 50000
  },
  "tiers": [
    {
      "name": "Mega",
      "seedAmount": 10000,
      "contributionRate": 0.0015
    }
  ],
  "riskControl": "Alert if growth >20% above average"
}
```

---

### XSpeedBadgeConfiguration

**Purpose**: Defines Velocity Tier achievement badges.

| Field | Type | Description |
|-------|------|-------------|
| `Id` | `string` | Badge identifier |
| `Name` | `string` | Badge name |
| `Description` | `string` | Achievement description |
| `Rarity` | `BadgeRarity` | Common, Rare, Epic, Legendary |
| `TierNumber` | `int` | Associated Velocity Tier |
| `UnlockCriteria` | `object` | How to earn the badge |

**Velocity Tier Badges**:
```json
[
  {
    "id": "velocity-ignition",
    "name": "Ignition Badge",
    "description": "Welcome to the Velocity Program!",
    "rarity": "Common",
    "tierNumber": 1,
    "unlockCriteria": { "type": "AccountCreated" }
  },
  {
    "id": "velocity-cruiser",
    "name": "Cruiser Badge",
    "description": "You've unlocked the second tier!",
    "rarity": "Rare",
    "tierNumber": 2,
    "unlockCriteria": { "type": "XpReached", "threshold": 500 }
  },
  {
    "id": "velocity-turbo",
    "name": "Turbo Badge",
    "description": "Power player status achieved!",
    "rarity": "Epic",
    "tierNumber": 3,
    "unlockCriteria": { "type": "XpReached", "threshold": 5000 }
  },
  {
    "id": "velocity-supersonic",
    "name": "Supersonic Badge",
    "description": "Elite VIP - you've reached the top!",
    "rarity": "Legendary",
    "tierNumber": 4,
    "unlockCriteria": { "type": "XpReached", "threshold": 25000 }
  }
]
```

---

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                    XSpeed Velocity Program                       │
└─────────────────────────────────────────────────────────────────┘
         │
         ├──────────────────────────────────────────────┐
         │                                              │
         ▼                                              ▼
┌─────────────────────┐                    ┌─────────────────────┐
│  Velocity Tier      │                    │  Badge Series       │
│  Configuration      │◄───────────────────│  "Velocity Tiers"   │
├─────────────────────┤                    ├─────────────────────┤
│ Tier 1: Ignition    │                    │ Ignition Badge      │
│ Tier 2: Cruiser     │                    │ Cruiser Badge       │
│ Tier 3: Turbo       │                    │ Turbo Badge         │
│ Tier 4: Supersonic  │                    │ Supersonic Badge    │
└─────────────────────┘                    └─────────────────────┘
         │
         │ unlocks
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Missions                                 │
├─────────────────────┬─────────────────────┬─────────────────────┤
│ Daily Driver (L1+)  │ Explorer (L2+)      │ Table Tactician (L3+)│
│ Whale Challenge (L4+)│                     │                     │
└─────────────────────┴─────────────────────┴─────────────────────┘
         │
         │ earn through
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Jackpots                                 │
├─────────────────────┬─────────────────────┬─────────────────────┤
│ Hourly Prize Drop   │ Daily Pot           │ Mega Pot            │
│ (every 60 mins)     │ (8-10 PM daily)     │ ($50,000 trigger)   │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

---

## Validation Rules

### VelocityTier
- `TierNumber`: 1-4 inclusive
- `XpRequired`: Non-negative, increasing order
- `Name`: Non-empty, unique across tiers

### Mission
- `RequiredLevel`: 1-4 inclusive
- `Tasks`: At least 1 task
- `CompletionXp`: Positive integer

### Jackpot
- `SeedAmount`: Positive decimal
- `ContributionRate`: 0 < rate <= 0.05 (max 5%)
- `TriggerAmount` (for AmountBased): Must exceed seed

### Badge
- `Rarity`: Common, Rare, Epic, Legendary
- `TierNumber`: 1-4 inclusive
- `XpThreshold`: Matches tier XP requirement

---

## State Transitions

### Scenario Setup State
```
[Not Setup] ──POST setup──► [Entities Created] ──activate=true──► [Entities Active]
```

### Entity Lifecycle
```
[Draft] ──publish──► [Active] ──archive──► [Archived]
```

---

*Generated with [Claude Code](https://claude.com/claude-code)*
