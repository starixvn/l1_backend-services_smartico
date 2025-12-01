# Dashboard API Integration - Data Model

**Version:** 1.0.0
**Created:** 2025-12-01

## Overview

This document defines the data models used for the Dashboard API Integration feature. The backend reads from MongoDB collections populated by backoffice-api.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MongoDB Database                                │
│                          (smartico_backoffice_dev)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   jackpots   │    │   missions   │    │    badges    │                  │
│  │  Collection  │    │  Collection  │    │  Collection  │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                   │                          │
│         │ OperatorId        │ OperatorId        │ OperatorId               │
│         │                   │                   │                          │
│         └───────────────────┼───────────────────┘                          │
│                             │                                              │
│                             ▼                                              │
│                    ┌────────────────────┐                                  │
│                    │  playerProgress    │                                  │
│                    │    Collection      │                                  │
│                    │    (NEW)           │                                  │
│                    └────────────────────┘                                  │
│                             │                                              │
│         ┌───────────────────┼───────────────────┐                          │
│         ▼                   ▼                   ▼                          │
│   missionProgress     badgesEarned      jackpotOptIns                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Existing Entities (From BackOffice.Domain)

### Jackpot Entity

**Collection:** `jackpots`

```csharp
public class Jackpot : IOperatorScoped
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    [BsonElement("operatorId")]
    public ObjectId OperatorId { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("iconUrl")]
    public string? IconUrl { get; set; }

    [BsonElement("type")]
    public JackpotType Type { get; set; }

    [BsonElement("status")]
    public JackpotStatus Status { get; set; }

    [BsonElement("tiers")]
    public List<JackpotTier> Tiers { get; set; } = new();

    [BsonElement("eligibleGames")]
    public List<string> EligibleGames { get; set; } = new();

    [BsonElement("trigger")]
    public JackpotTrigger? Trigger { get; set; }

    [BsonElement("prizeDistribution")]
    public JackpotPrizeDistribution? PrizeDistribution { get; set; }

    [BsonElement("currency")]
    public string Currency { get; set; } = "USD";

    [BsonElement("startDate")]
    public DateTime StartDate { get; set; }

    [BsonElement("endDate")]
    public DateTime? EndDate { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}
```

**Related Value Objects:**

```csharp
public class JackpotTier
{
    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;  // "Grand", "Major", "Minor", "Mini"

    [BsonElement("seedValue")]
    public decimal SeedValue { get; set; }

    [BsonElement("currentValue")]
    public decimal CurrentValue { get; set; }

    [BsonElement("contributionRate")]
    public decimal ContributionRate { get; set; }  // Percentage: 0.01 = 1%

    [BsonElement("maxValue")]
    public decimal? MaxValue { get; set; }
}

public enum JackpotStatus
{
    Draft,
    Active,
    Paused,
    Completed,
    Archived
}

public enum JackpotType
{
    Progressive,
    Fixed
}
```

---

### Mission Entity

**Collection:** `missions`

```csharp
public class Mission : IOperatorScoped
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    [BsonElement("operatorId")]
    public ObjectId OperatorId { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("status")]
    public MissionStatus Status { get; set; }

    [BsonElement("completionXp")]
    public int CompletionXp { get; set; }

    [BsonElement("tasks")]
    public List<MissionTask> Tasks { get; set; } = new();

    [BsonElement("targetSegment")]
    public PlayerSegment TargetSegment { get; set; }

    [BsonElement("startDate")]
    public DateTime StartDate { get; set; }

    [BsonElement("endDate")]
    public DateTime EndDate { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}
```

**Related Value Objects:**

```csharp
public class MissionTask
{
    [BsonElement("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("trigger")]
    public TaskTrigger? Trigger { get; set; }

    [BsonElement("goal")]
    public TaskGoal? Goal { get; set; }
}

public class TaskGoal
{
    [BsonElement("type")]
    public GoalType Type { get; set; }

    [BsonElement("targetCount")]
    public int? TargetCount { get; set; }

    [BsonElement("targetAmount")]
    public decimal? TargetAmount { get; set; }
}

public enum MissionStatus
{
    Draft,
    Active,
    Completed,
    Cancelled
}
```

---

### Badge Entity

**Collection:** `badges`

```csharp
public class Badge : IOperatorScoped
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    [BsonElement("operatorId")]
    public ObjectId OperatorId { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("iconUrl")]
    public string? IconUrl { get; set; }

    [BsonElement("rarity")]
    public BadgeRarity Rarity { get; set; }

    [BsonElement("status")]
    public BadgeStatus Status { get; set; }

    [BsonElement("unlockCriteria")]
    public BadgeUnlockCriteria? UnlockCriteria { get; set; }

    [BsonElement("reward")]
    public BadgeReward? Reward { get; set; }

    [BsonElement("isHidden")]
    public bool IsHidden { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}

public enum BadgeRarity
{
    Common,
    Rare,
    Epic,
    Legendary
}

public enum BadgeStatus
{
    Draft,
    Active,
    Archived
}
```

---

## New Entity: PlayerProgress

**Collection:** `playerProgress`

```csharp
/// <summary>
/// Tracks player progress for missions, badges, and jackpots.
/// One document per player per operator.
/// </summary>
public class PlayerProgress : IOperatorScoped
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    /// <summary>
    /// Operator this player belongs to (multi-tenant isolation).
    /// </summary>
    [BsonElement("operatorId")]
    public ObjectId OperatorId { get; set; }

    /// <summary>
    /// External player identifier (from userId parameter).
    /// </summary>
    [BsonElement("playerId")]
    public string PlayerId { get; set; } = string.Empty;

    /// <summary>
    /// Progress for each mission. Key is mission ObjectId as string.
    /// </summary>
    [BsonElement("missionProgress")]
    public Dictionary<string, MissionProgressData> MissionProgress { get; set; } = new();

    /// <summary>
    /// List of badges earned by this player.
    /// </summary>
    [BsonElement("badgesEarned")]
    public List<EarnedBadge> BadgesEarned { get; set; } = new();

    /// <summary>
    /// List of jackpot ObjectIds the player has opted into.
    /// </summary>
    [BsonElement("jackpotOptIns")]
    public List<string> JackpotOptIns { get; set; } = new();

    /// <summary>
    /// Contributions to each jackpot. Key is jackpot ObjectId as string.
    /// </summary>
    [BsonElement("jackpotContributions")]
    public Dictionary<string, decimal> JackpotContributions { get; set; } = new();

    /// <summary>
    /// Current player level.
    /// </summary>
    [BsonElement("level")]
    public int Level { get; set; } = 1;

    /// <summary>
    /// Current XP points.
    /// </summary>
    [BsonElement("xp")]
    public int Xp { get; set; } = 0;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// Progress data for a single mission.
/// </summary>
public class MissionProgressData
{
    /// <summary>
    /// Progress per task. Key is task ID.
    /// </summary>
    [BsonElement("taskProgress")]
    public Dictionary<string, int> TaskProgress { get; set; } = new();

    /// <summary>
    /// Total current value (for single-task missions).
    /// </summary>
    [BsonElement("currentValue")]
    public int CurrentValue { get; set; }

    /// <summary>
    /// When the mission was completed, or null if not completed.
    /// </summary>
    [BsonElement("completedAt")]
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// When the reward was claimed, or null if not claimed.
    /// </summary>
    [BsonElement("claimedAt")]
    public DateTime? ClaimedAt { get; set; }
}

/// <summary>
/// Record of an earned badge.
/// </summary>
public class EarnedBadge
{
    /// <summary>
    /// Badge ObjectId as string.
    /// </summary>
    [BsonElement("badgeId")]
    public string BadgeId { get; set; } = string.Empty;

    /// <summary>
    /// When the badge was earned.
    /// </summary>
    [BsonElement("earnedAt")]
    public DateTime EarnedAt { get; set; }
}
```

---

## MongoDB Indexes

### playerProgress Collection

```javascript
// Unique index for player lookup
db.playerProgress.createIndex(
  { "operatorId": 1, "playerId": 1 },
  { unique: true, name: "idx_operatorId_playerId" }
);

// Index for operator queries
db.playerProgress.createIndex(
  { "operatorId": 1 },
  { name: "idx_operatorId" }
);
```

---

## API Response DTOs

### JackpotDto (Existing - for reference)

```csharp
public class JackpotDto
{
    public int TemplateId { get; set; }
    public JackpotPublicMeta PublicMeta { get; set; } = new();
    public List<JackpotPot> Pots { get; set; } = new();
    public bool IsOptedIn { get; set; }
    public string Temperature { get; set; } = "Cold";  // "Hot", "Warm", "Cold"
}

public class JackpotPublicMeta
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
}

public class JackpotPot
{
    public string Name { get; set; } = string.Empty;
    public decimal CurrentValue { get; set; }
}
```

### MissionDto (Existing - for reference)

```csharp
public class Mission
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int Progress { get; set; }  // 0-100
    public int TargetValue { get; set; }
    public int CurrentValue { get; set; }
    public int RewardAmount { get; set; }
    public string RewardCurrency { get; set; } = "XP";
    public DateTime? ExpiresAt { get; set; }
    public bool IsCompleted { get; set; }
}
```

### BadgeDto (Existing - for reference)

```csharp
public class Badge
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string Category { get; set; } = "Common";  // Rarity
    public bool IsEarned { get; set; }
    public DateTime? EarnedAt { get; set; }
}
```

---

## Data Mapping

### Jackpot (MongoDB) → JackpotDto (API)

| MongoDB Field | API Field | Transformation |
|---------------|-----------|----------------|
| `Id` | `TemplateId` | `Id.GetHashCode()` |
| `Name` | `PublicMeta.Name` | Direct |
| `Description` | `PublicMeta.Description` | Direct |
| `IconUrl` | `PublicMeta.ImageUrl` | Direct |
| `Tiers[].Name` | `Pots[].Name` | Direct |
| `Tiers[].CurrentValue` | `Pots[].CurrentValue` | Direct |
| PlayerProgress.JackpotOptIns | `IsOptedIn` | Contains check |
| Calculated | `Temperature` | Based on current/max ratio |

### Mission (MongoDB) → MissionDto (API)

| MongoDB Field | API Field | Transformation |
|---------------|-----------|----------------|
| `Id` | `Id` | `Id.GetHashCode()` |
| `Name` | `Name` | Direct |
| `Description` | `Description` | Direct |
| `Tasks[0].Goal.TargetCount` | `TargetValue` | Direct |
| PlayerProgress.CurrentValue | `CurrentValue` | From progress |
| Calculated | `Progress` | `(CurrentValue / TargetValue) * 100` |
| `CompletionXp` | `RewardAmount` | Direct |
| `EndDate` | `ExpiresAt` | Direct |
| PlayerProgress.CompletedAt | `IsCompleted` | `!= null` |

### Badge (MongoDB) → BadgeDto (API)

| MongoDB Field | API Field | Transformation |
|---------------|-----------|----------------|
| `Id` | `Id` | `Id.GetHashCode()` |
| `Name` | `Name` | Direct |
| `Description` | `Description` | Direct |
| `IconUrl` | `ImageUrl` | Direct |
| `Rarity` | `Category` | Enum to string |
| PlayerProgress.BadgesEarned | `IsEarned` | Contains check |
| PlayerProgress.EarnedAt | `EarnedAt` | From progress |

---

## Validation Rules

### PlayerProgress Validation

| Field | Rule |
|-------|------|
| `PlayerId` | Required, non-empty string |
| `OperatorId` | Required, valid ObjectId |
| `Level` | >= 1 |
| `Xp` | >= 0 |
| `MissionProgress.CurrentValue` | >= 0 |

---

*Generated with [Claude Code](https://claude.com/claude-code)*
