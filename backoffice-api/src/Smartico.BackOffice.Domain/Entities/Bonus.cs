using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Domain.Entities;

/// <summary>
/// Represents a bonus template that defines reward calculation rules.
/// Bonuses are reusable templates that can be issued through various channels
/// (missions, tournaments, store, mini-games, campaigns, automation).
/// Actual bonus execution (wagering, balance) is handled by external platforms.
/// </summary>
public class Bonus : IOperatorScoped
{
    /// <summary>
    /// Unique identifier for the bonus.
    /// </summary>
    [BsonId]
    [BsonElement("_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    /// <summary>
    /// Operator (casino/game provider) that owns this bonus.
    /// Used for multi-tenant data isolation.
    /// </summary>
    [BsonElement("operatorId")]
    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId OperatorId { get; set; }

    /// <summary>
    /// Bonus name displayed to operators and players.
    /// </summary>
    [BsonElement("name")]
    [BsonRequired]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional detailed description of the bonus.
    /// </summary>
    [BsonElement("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Type of bonus (DepositMatch, FixedBonus, FreeSpins, Cashback, Referral).
    /// </summary>
    [BsonElement("type")]
    [BsonRequired]
    [BsonRepresentation(BsonType.String)]
    public BonusType Type { get; set; }

    /// <summary>
    /// Current status of the bonus (Draft, Active, Paused, Expired, Cancelled).
    /// </summary>
    [BsonElement("status")]
    [BsonRequired]
    [BsonRepresentation(BsonType.String)]
    public BonusStatus Status { get; set; } = BonusStatus.Draft;

    /// <summary>
    /// Activation type (Automatic on deposit, Manual via code).
    /// </summary>
    [BsonElement("activationType")]
    [BsonRequired]
    [BsonRepresentation(BsonType.String)]
    public BonusActivationType ActivationType { get; set; } = BonusActivationType.Automatic;

    /// <summary>
    /// Gift code for manual activation (required if ActivationType is Manual).
    /// </summary>
    [BsonElement("giftCode")]
    public string? GiftCode { get; set; }

    /// <summary>
    /// Free spins configuration (for FreeSpins bonus type).
    /// </summary>
    [BsonElement("freeSpins")]
    public FreeSpinsConfig? FreeSpins { get; set; }

    /// <summary>
    /// Cash configuration (for Cash bonus type).
    /// </summary>
    [BsonElement("cash")]
    public CashConfig? Cash { get; set; }

    /// <summary>
    /// Points configuration (for Points bonus type).
    /// </summary>
    [BsonElement("points")]
    public PointsConfig? Points { get; set; }

    /// <summary>
    /// Bonus start date and time (UTC).
    /// </summary>
    [BsonElement("startDate")]
    [BsonRequired]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Bonus end date and time (UTC).
    /// </summary>
    [BsonElement("endDate")]
    [BsonRequired]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime EndDate { get; set; }

    /// <summary>
    /// Calculation rules for dynamic bonus amounts.
    /// Defines whether bonus is fixed or calculated based on player activity.
    /// </summary>
    [BsonElement("calculationRule")]
    public BonusCalculationRule? CalculationRule { get; set; }

    /// <summary>
    /// Per-bonus limits for controlling distribution.
    /// </summary>
    [BsonElement("limits")]
    public BonusLimits? Limits { get; set; }

    /// <summary>
    /// Timestamp when the bonus was created (UTC).
    /// </summary>
    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when the bonus was last updated (UTC).
    /// </summary>
    [BsonElement("updatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Types of bonuses available.
/// Simplified to 3 award types that represent what players receive.
/// </summary>
public enum BonusType
{
    /// <summary>
    /// Free spins bonus - awards spins on games.
    /// </summary>
    FreeSpins,

    /// <summary>
    /// Cash bonus - awards bonus cash/credit.
    /// </summary>
    Cash,

    /// <summary>
    /// Points bonus - awards loyalty/gamification points.
    /// </summary>
    Points
}

/// <summary>
/// Status of a bonus.
/// </summary>
public enum BonusStatus
{
    /// <summary>
    /// Bonus is being created/configured.
    /// </summary>
    Draft,

    /// <summary>
    /// Bonus is active and available to players.
    /// </summary>
    Active,

    /// <summary>
    /// Bonus is temporarily paused.
    /// </summary>
    Paused,

    /// <summary>
    /// Bonus has expired.
    /// </summary>
    Expired,

    /// <summary>
    /// Bonus was cancelled.
    /// </summary>
    Cancelled
}

/// <summary>
/// How the bonus is activated.
/// </summary>
public enum BonusActivationType
{
    /// <summary>
    /// Automatically applied on qualifying action (e.g., deposit).
    /// </summary>
    Automatic,

    /// <summary>
    /// Player must enter a gift code to claim.
    /// </summary>
    Manual
}
