using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Domain.Entities;

/// <summary>
/// Type of jackpot determining contribution behavior.
/// </summary>
public enum JackpotType
{
    /// <summary>
    /// Progressive jackpot - grows from player contributions.
    /// </summary>
    Progressive,

    /// <summary>
    /// Fixed jackpot - static prize amount.
    /// </summary>
    Fixed
}

/// <summary>
/// Status of a jackpot in its lifecycle.
/// </summary>
public enum JackpotStatus
{
    /// <summary>
    /// Jackpot is being configured, not visible to players.
    /// </summary>
    Draft,

    /// <summary>
    /// Jackpot is live and accepting contributions.
    /// </summary>
    Active,

    /// <summary>
    /// Jackpot is temporarily paused.
    /// </summary>
    Paused,

    /// <summary>
    /// Jackpot has been completed (ended or all prizes won).
    /// </summary>
    Completed,

    /// <summary>
    /// Jackpot is archived for historical reference.
    /// </summary>
    Archived
}

/// <summary>
/// Type of trigger that determines when jackpot is won.
/// </summary>
public enum JackpotTriggerType
{
    /// <summary>
    /// Random chance on each qualifying bet.
    /// </summary>
    Random,

    /// <summary>
    /// Triggered when bet amount meets threshold.
    /// </summary>
    ValueBased,

    /// <summary>
    /// Triggered at scheduled time intervals (must-drop).
    /// </summary>
    TimeBased,

    /// <summary>
    /// Triggered when jackpot value reaches a specific amount (must-drop at amount).
    /// </summary>
    AmountBased
}

/// <summary>
/// Behavior when jackpot is won and resets.
/// </summary>
public enum JackpotResetBehavior
{
    /// <summary>
    /// Reset to the seed amount after win.
    /// </summary>
    ResetToSeed,

    /// <summary>
    /// Reset to zero after win.
    /// </summary>
    ResetToZero,

    /// <summary>
    /// Keep remainder after paying winner (for split distributions).
    /// </summary>
    KeepRemainder
}

/// <summary>
/// Type of prize distribution when jackpot is won.
/// </summary>
public enum PrizeDistributionType
{
    /// <summary>
    /// Single winner takes entire jackpot.
    /// </summary>
    WinnerTakesAll,

    /// <summary>
    /// Prize split among multiple winners using fixed percentages.
    /// </summary>
    SplitAmongWinners,

    /// <summary>
    /// Prize distributed proportionally based on player wager amounts.
    /// Players who bet more receive a larger share of the prize.
    /// </summary>
    ProportionalToWager
}

/// <summary>
/// Represents a jackpot configuration with tiers, triggers, and prize distribution.
/// Operator-scoped: Each operator creates their own jackpots.
/// </summary>
public class Jackpot : IOperatorScoped
{
    /// <summary>
    /// Unique identifier for the jackpot.
    /// </summary>
    [BsonId]
    [BsonElement("_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    /// <summary>
    /// Operator (casino/game provider) that owns this jackpot.
    /// Used for multi-tenant data isolation.
    /// </summary>
    [BsonElement("operatorId")]
    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId OperatorId { get; set; }

    /// <summary>
    /// Jackpot name displayed to players.
    /// </summary>
    [BsonElement("name")]
    [BsonRequired]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional description of the jackpot.
    /// </summary>
    [BsonElement("description")]
    [BsonIgnoreIfNull]
    public string? Description { get; set; }

    /// <summary>
    /// Type of jackpot (Progressive or Fixed).
    /// </summary>
    [BsonElement("type")]
    [BsonRepresentation(BsonType.String)]
    public JackpotType Type { get; set; } = JackpotType.Progressive;

    /// <summary>
    /// Current status of the jackpot.
    /// </summary>
    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public JackpotStatus Status { get; set; } = JackpotStatus.Draft;

    /// <summary>
    /// Jackpot tiers (Mini, Minor, Major, Grand or custom).
    /// Supports single or multi-tier configurations.
    /// </summary>
    [BsonElement("tiers")]
    public List<JackpotTier> Tiers { get; set; } = new();

    /// <summary>
    /// Game IDs that contribute to this jackpot.
    /// </summary>
    [BsonElement("eligibleGames")]
    public List<string> EligibleGames { get; set; } = new();

    /// <summary>
    /// Prize distribution configuration.
    /// </summary>
    [BsonElement("prizeDistribution")]
    public JackpotPrizeDistribution PrizeDistribution { get; set; } = new();

    /// <summary>
    /// Behavior when jackpot is won and resets.
    /// </summary>
    [BsonElement("resetBehavior")]
    [BsonRepresentation(BsonType.String)]
    public JackpotResetBehavior ResetBehavior { get; set; } = JackpotResetBehavior.ResetToSeed;

    /// <summary>
    /// Currency code for jackpot values (e.g., USD, EUR).
    /// </summary>
    [BsonElement("currency")]
    public string Currency { get; set; } = "USD";

    /// <summary>
    /// Optional start date for the jackpot.
    /// </summary>
    [BsonElement("startDate")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    [BsonIgnoreIfNull]
    public DateTime? StartDate { get; set; }

    /// <summary>
    /// Optional end date for the jackpot.
    /// </summary>
    [BsonElement("endDate")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    [BsonIgnoreIfNull]
    public DateTime? EndDate { get; set; }

    /// <summary>
    /// Lifetime total contributions to this jackpot.
    /// </summary>
    [BsonElement("totalContributions")]
    public decimal TotalContributions { get; set; }

    /// <summary>
    /// Lifetime total payouts from this jackpot.
    /// </summary>
    [BsonElement("totalPayouts")]
    public decimal TotalPayouts { get; set; }

    /// <summary>
    /// Timestamp when jackpot was last won.
    /// </summary>
    [BsonElement("lastWonAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    [BsonIgnoreIfNull]
    public DateTime? LastWonAt { get; set; }

    /// <summary>
    /// Player ID of the last winner.
    /// </summary>
    [BsonElement("lastWinnerPlayerId")]
    [BsonIgnoreIfNull]
    public string? LastWinnerPlayerId { get; set; }

    /// <summary>
    /// Amount won in the last win.
    /// </summary>
    [BsonElement("lastWinAmount")]
    [BsonIgnoreIfNull]
    public decimal? LastWinAmount { get; set; }

    /// <summary>
    /// User ID of the creator.
    /// </summary>
    [BsonElement("createdBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonIgnoreIfNull]
    public ObjectId? CreatedBy { get; set; }

    /// <summary>
    /// Timestamp when the jackpot was created (UTC).
    /// </summary>
    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when the jackpot was last updated (UTC).
    /// </summary>
    [BsonElement("updatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
