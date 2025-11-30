using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Smartico.BackOffice.Domain.Entities;

/// <summary>
/// Represents a player level and progression system configuration.
/// Defines levels, tiers, XP earning rules, and rewards for player advancement.
/// Each operator can have one active level system.
/// </summary>
public class LevelSystem : IOperatorScoped
{
    /// <summary>
    /// Unique identifier for the level system.
    /// </summary>
    [BsonId]
    [BsonElement("_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    /// <summary>
    /// Operator (casino/game provider) that owns this level system.
    /// Used for multi-tenant data isolation.
    /// </summary>
    [BsonElement("operatorId")]
    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId OperatorId { get; set; }

    /// <summary>
    /// Name of the level system (e.g., "VIP Progression", "Player Ranks").
    /// </summary>
    [BsonElement("name")]
    [BsonRequired]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional description of the level system.
    /// </summary>
    [BsonElement("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Current status of the level system.
    /// </summary>
    [BsonElement("status")]
    [BsonRequired]
    [BsonRepresentation(BsonType.String)]
    public LevelSystemStatus Status { get; set; } = LevelSystemStatus.Draft;

    /// <summary>
    /// Maximum level a player can reach in this system.
    /// </summary>
    [BsonElement("maxLevel")]
    [BsonRequired]
    public int MaxLevel { get; set; } = 100;

    /// <summary>
    /// Type of progression curve for XP requirements.
    /// </summary>
    [BsonElement("progressionCurve")]
    [BsonRequired]
    [BsonRepresentation(BsonType.String)]
    public ProgressionCurveType ProgressionCurve { get; set; } = ProgressionCurveType.Linear;

    /// <summary>
    /// Base XP required for level 1 to level 2.
    /// </summary>
    [BsonElement("baseXpRequired")]
    [BsonRequired]
    public int BaseXpRequired { get; set; } = 100;

    /// <summary>
    /// Multiplier for exponential progression (e.g., 1.5 means each level needs 1.5x more XP).
    /// Only used when ProgressionCurve is Exponential.
    /// </summary>
    [BsonElement("xpMultiplier")]
    public decimal XpMultiplier { get; set; } = 1.5m;

    /// <summary>
    /// Tiers that group levels together (e.g., Bronze: 1-10, Silver: 11-25).
    /// </summary>
    [BsonElement("tiers")]
    public List<LevelTier> Tiers { get; set; } = new();

    /// <summary>
    /// XP earning rules that define how players earn XP.
    /// </summary>
    [BsonElement("xpRules")]
    public List<XpRule> XpRules { get; set; } = new();

    /// <summary>
    /// Rewards granted when players reach specific levels.
    /// </summary>
    [BsonElement("levelRewards")]
    public List<LevelReward> LevelRewards { get; set; } = new();

    /// <summary>
    /// Whether players can be demoted to lower tiers.
    /// </summary>
    [BsonElement("demotionEnabled")]
    public bool DemotionEnabled { get; set; } = false;

    /// <summary>
    /// Demotion rules configuration (only applicable if DemotionEnabled is true).
    /// </summary>
    [BsonElement("demotionRules")]
    public DemotionRules? DemotionRules { get; set; }

    /// <summary>
    /// Timestamp when the level system was created (UTC).
    /// </summary>
    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when the level system was last updated (UTC).
    /// </summary>
    [BsonElement("updatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Status of a level system.
/// </summary>
public enum LevelSystemStatus
{
    /// <summary>
    /// Level system is being configured.
    /// </summary>
    Draft,

    /// <summary>
    /// Level system is active and tracking player progress.
    /// </summary>
    Active,

    /// <summary>
    /// Level system is paused (XP not being earned).
    /// </summary>
    Paused,

    /// <summary>
    /// Level system is archived (read-only historical data).
    /// </summary>
    Archived
}

/// <summary>
/// Type of XP progression curve.
/// </summary>
public enum ProgressionCurveType
{
    /// <summary>
    /// Each level requires the same additional XP (e.g., 100, 200, 300...).
    /// </summary>
    Linear,

    /// <summary>
    /// Each level requires XP multiplied by a factor (e.g., 100, 150, 225...).
    /// </summary>
    Exponential,

    /// <summary>
    /// Custom XP thresholds defined per level.
    /// </summary>
    Custom
}

/// <summary>
/// Represents a tier that groups multiple levels together.
/// </summary>
public class LevelTier
{
    /// <summary>
    /// Unique identifier for the tier.
    /// </summary>
    [BsonElement("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    /// <summary>
    /// Name of the tier (e.g., "Bronze", "Silver", "Gold").
    /// </summary>
    [BsonElement("name")]
    [BsonRequired]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Starting level for this tier (inclusive).
    /// </summary>
    [BsonElement("fromLevel")]
    [BsonRequired]
    public int FromLevel { get; set; }

    /// <summary>
    /// Ending level for this tier (inclusive).
    /// </summary>
    [BsonElement("toLevel")]
    [BsonRequired]
    public int ToLevel { get; set; }

    /// <summary>
    /// Color code for the tier (for UI display, e.g., "#CD7F32" for bronze).
    /// </summary>
    [BsonElement("color")]
    public string? Color { get; set; }

    /// <summary>
    /// Icon name or URL for the tier.
    /// </summary>
    [BsonElement("icon")]
    public string? Icon { get; set; }

    /// <summary>
    /// Order for display purposes (lower = shown first).
    /// </summary>
    [BsonElement("order")]
    public int Order { get; set; }

    /// <summary>
    /// Ongoing benefits for players in this tier.
    /// </summary>
    [BsonElement("benefits")]
    public List<TierBenefit> Benefits { get; set; } = new();
}

/// <summary>
/// Represents an ongoing benefit for being in a specific tier.
/// </summary>
public class TierBenefit
{
    /// <summary>
    /// Type of benefit.
    /// </summary>
    [BsonElement("type")]
    [BsonRepresentation(BsonType.String)]
    public TierBenefitType Type { get; set; }

    /// <summary>
    /// Description of the benefit.
    /// </summary>
    [BsonElement("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Value of the benefit (e.g., 5 for 5% cashback, 1000 for withdrawal limit).
    /// </summary>
    [BsonElement("value")]
    public decimal? Value { get; set; }
}

/// <summary>
/// Types of tier benefits.
/// </summary>
public enum TierBenefitType
{
    /// <summary>
    /// Higher cashback percentage.
    /// </summary>
    CashbackBoost,

    /// <summary>
    /// Access to VIP support.
    /// </summary>
    VipSupport,

    /// <summary>
    /// Higher withdrawal limits.
    /// </summary>
    WithdrawalLimitBoost,

    /// <summary>
    /// Access to exclusive tournaments.
    /// </summary>
    ExclusiveTournaments,

    /// <summary>
    /// XP earning multiplier.
    /// </summary>
    XpMultiplier,

    /// <summary>
    /// Custom benefit.
    /// </summary>
    Custom
}

/// <summary>
/// Represents a rule for earning XP.
/// </summary>
public class XpRule
{
    /// <summary>
    /// Unique identifier for the rule.
    /// </summary>
    [BsonElement("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    /// <summary>
    /// Type of action that triggers XP earning.
    /// </summary>
    [BsonElement("actionType")]
    [BsonRequired]
    [BsonRepresentation(BsonType.String)]
    public XpActionType ActionType { get; set; }

    /// <summary>
    /// Amount of XP earned per action or per unit.
    /// </summary>
    [BsonElement("xpAmount")]
    [BsonRequired]
    public int XpAmount { get; set; }

    /// <summary>
    /// Unit amount for proportional XP (e.g., earn 1 XP per $10 bet).
    /// If null, XpAmount is earned per action.
    /// </summary>
    [BsonElement("perUnitAmount")]
    public decimal? PerUnitAmount { get; set; }

    /// <summary>
    /// Maximum XP that can be earned from this action per day.
    /// Null means unlimited.
    /// </summary>
    [BsonElement("dailyCap")]
    public int? DailyCap { get; set; }

    /// <summary>
    /// Optional: Specific games that qualify for this rule.
    /// Null means all games qualify.
    /// </summary>
    [BsonElement("eligibleGames")]
    public List<string>? EligibleGames { get; set; }

    /// <summary>
    /// Whether this rule is currently active.
    /// </summary>
    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Description of the rule for display.
    /// </summary>
    [BsonElement("description")]
    public string? Description { get; set; }
}

/// <summary>
/// Types of actions that can earn XP.
/// </summary>
public enum XpActionType
{
    /// <summary>
    /// XP earned based on bet/wager amount.
    /// </summary>
    Bet,

    /// <summary>
    /// XP earned based on deposit amount.
    /// </summary>
    Deposit,

    /// <summary>
    /// XP earned for participating in a tournament.
    /// </summary>
    TournamentParticipation,

    /// <summary>
    /// XP earned for winning a tournament.
    /// </summary>
    TournamentWin,

    /// <summary>
    /// XP earned for daily login.
    /// </summary>
    DailyLogin,

    /// <summary>
    /// XP earned for referring a friend.
    /// </summary>
    Referral,

    /// <summary>
    /// XP earned for unlocking a badge.
    /// </summary>
    BadgeUnlock,

    /// <summary>
    /// Custom XP action.
    /// </summary>
    Custom
}

/// <summary>
/// Represents a reward granted when reaching a specific level.
/// </summary>
public class LevelReward
{
    /// <summary>
    /// Unique identifier for the reward.
    /// </summary>
    [BsonElement("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    /// <summary>
    /// Level at which this reward is granted.
    /// </summary>
    [BsonElement("level")]
    [BsonRequired]
    public int Level { get; set; }

    /// <summary>
    /// Type of reward.
    /// </summary>
    [BsonElement("rewardType")]
    [BsonRequired]
    [BsonRepresentation(BsonType.String)]
    public LevelRewardType RewardType { get; set; }

    /// <summary>
    /// Value of the reward (number of spins, cash amount, etc.).
    /// </summary>
    [BsonElement("value")]
    public decimal? Value { get; set; }

    /// <summary>
    /// Bonus template ID if reward type is BonusTemplate.
    /// </summary>
    [BsonElement("bonusTemplateId")]
    public string? BonusTemplateId { get; set; }

    /// <summary>
    /// Bonus template name for display.
    /// </summary>
    [BsonElement("bonusTemplateName")]
    public string? BonusTemplateName { get; set; }

    /// <summary>
    /// Badge ID if reward type is Badge.
    /// </summary>
    [BsonElement("badgeId")]
    public string? BadgeId { get; set; }

    /// <summary>
    /// Badge name for display.
    /// </summary>
    [BsonElement("badgeName")]
    public string? BadgeName { get; set; }

    /// <summary>
    /// Description of the reward.
    /// </summary>
    [BsonElement("description")]
    public string? Description { get; set; }
}

/// <summary>
/// Types of rewards for reaching a level.
/// </summary>
public enum LevelRewardType
{
    /// <summary>
    /// Free spins reward.
    /// </summary>
    FreeSpins,

    /// <summary>
    /// Cash/credit reward.
    /// </summary>
    Cash,

    /// <summary>
    /// Bonus template (references an existing bonus).
    /// </summary>
    BonusTemplate,

    /// <summary>
    /// Access to exclusive mission.
    /// </summary>
    ExclusiveMission,

    /// <summary>
    /// XP boost multiplier (temporary).
    /// </summary>
    XpBoost,

    /// <summary>
    /// Badge/achievement unlock.
    /// </summary>
    Badge
}

/// <summary>
/// Configuration for player tier demotion.
/// </summary>
public class DemotionRules
{
    /// <summary>
    /// Number of days of inactivity before demotion.
    /// </summary>
    [BsonElement("inactiveDays")]
    public int InactiveDays { get; set; } = 90;

    /// <summary>
    /// Whether to demote by one tier at a time or reset completely.
    /// </summary>
    [BsonElement("demotionType")]
    [BsonRepresentation(BsonType.String)]
    public DemotionType DemotionType { get; set; } = DemotionType.OneTier;

    /// <summary>
    /// Grace period warning days before demotion.
    /// </summary>
    [BsonElement("warningDays")]
    public int WarningDays { get; set; } = 7;

    /// <summary>
    /// Whether to preserve XP within the demoted tier.
    /// </summary>
    [BsonElement("preserveXp")]
    public bool PreserveXp { get; set; } = true;
}

/// <summary>
/// Types of demotion behavior.
/// </summary>
public enum DemotionType
{
    /// <summary>
    /// Demote by one tier at a time.
    /// </summary>
    OneTier,

    /// <summary>
    /// Reset to the lowest tier.
    /// </summary>
    ResetToBottom,

    /// <summary>
    /// Demote by one level at a time.
    /// </summary>
    OneLevel
}
