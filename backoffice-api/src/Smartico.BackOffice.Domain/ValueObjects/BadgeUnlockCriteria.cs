using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Smartico.BackOffice.Domain.ValueObjects;

/// <summary>
/// Types of unlock criteria for badges.
/// Defines what player action or achievement triggers badge unlock.
/// </summary>
public enum BadgeUnlockCriteriaType
{
    /// <summary>
    /// Complete a number of missions.
    /// </summary>
    MissionCompleted,

    /// <summary>
    /// Cumulative wagering amount.
    /// </summary>
    WagerAmount,

    /// <summary>
    /// Cumulative deposit amount.
    /// </summary>
    DepositAmount,

    /// <summary>
    /// Number of bets placed.
    /// </summary>
    BetCount,

    /// <summary>
    /// Number of tournament victories.
    /// </summary>
    TournamentWins,

    /// <summary>
    /// Number of tournaments entered.
    /// </summary>
    TournamentParticipations,

    /// <summary>
    /// Consecutive daily logins.
    /// </summary>
    LoginStreak,

    /// <summary>
    /// Total login days (non-consecutive).
    /// </summary>
    TotalLogins,

    /// <summary>
    /// Reach a specific level.
    /// </summary>
    LevelReached,

    /// <summary>
    /// Reach a specific tier.
    /// </summary>
    TierReached,

    /// <summary>
    /// Play specific game(s) N times.
    /// </summary>
    GamePlayed,

    /// <summary>
    /// Make first deposit (one-time).
    /// </summary>
    FirstDeposit,

    /// <summary>
    /// Place first bet (one-time).
    /// </summary>
    FirstBet,

    /// <summary>
    /// Operator-defined custom criteria.
    /// </summary>
    Custom
}

/// <summary>
/// Represents the unlock criteria configuration for a badge.
/// Defines what players must achieve to unlock the badge.
/// </summary>
public class BadgeUnlockCriteria
{
    /// <summary>
    /// Type of unlock criteria.
    /// </summary>
    [BsonElement("type")]
    [BsonRepresentation(BsonType.String)]
    public BadgeUnlockCriteriaType Type { get; set; }

    /// <summary>
    /// Threshold value (count or amount depending on criteria type).
    /// For count-based: number of times (e.g., 100 missions)
    /// For amount-based: monetary value (e.g., $10,000)
    /// For level-based: level number (e.g., level 50)
    /// </summary>
    [BsonElement("thresholdValue")]
    public decimal ThresholdValue { get; set; }

    /// <summary>
    /// Optional list of game IDs for GamePlayed criteria.
    /// If null/empty, all games count toward the criteria.
    /// </summary>
    [BsonElement("eligibleGames")]
    [BsonIgnoreIfNull]
    public List<string>? EligibleGames { get; set; }

    /// <summary>
    /// Target tier name for TierReached criteria (e.g., "Gold", "Platinum").
    /// </summary>
    [BsonElement("targetTier")]
    [BsonIgnoreIfNull]
    public string? TargetTier { get; set; }

    /// <summary>
    /// Custom event name for Custom criteria type.
    /// </summary>
    [BsonElement("customEventName")]
    [BsonIgnoreIfNull]
    public string? CustomEventName { get; set; }

    /// <summary>
    /// Optional description of the criteria for display purposes.
    /// </summary>
    [BsonElement("description")]
    [BsonIgnoreIfNull]
    public string? Description { get; set; }
}
