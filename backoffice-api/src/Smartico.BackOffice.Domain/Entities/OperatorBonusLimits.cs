using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Smartico.BackOffice.Domain.Entities;

/// <summary>
/// Global bonus limits for an operator.
/// These limits apply across ALL bonuses for the operator.
/// Example: If maxDailyBonusValuePerPlayer = 100, a player can claim
/// Bonus A (20) + Bonus B (50) + Bonus C (30) = 100, but not more.
/// </summary>
public class OperatorBonusLimits : IOperatorScoped
{
    /// <summary>
    /// Unique identifier for the settings.
    /// </summary>
    [BsonId]
    [BsonElement("_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    /// <summary>
    /// Operator (casino/game provider) that owns these settings.
    /// </summary>
    [BsonElement("operatorId")]
    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId OperatorId { get; set; }

    /// <summary>
    /// Maximum total bonus value a player can receive per day across all bonuses.
    /// Null means unlimited.
    /// </summary>
    [BsonElement("maxDailyBonusValuePerPlayer")]
    public decimal? MaxDailyBonusValuePerPlayer { get; set; }

    /// <summary>
    /// Maximum total bonus value a player can receive per week across all bonuses.
    /// Null means unlimited.
    /// </summary>
    [BsonElement("maxWeeklyBonusValuePerPlayer")]
    public decimal? MaxWeeklyBonusValuePerPlayer { get; set; }

    /// <summary>
    /// Maximum total bonus value a player can receive per month across all bonuses.
    /// Null means unlimited.
    /// </summary>
    [BsonElement("maxMonthlyBonusValuePerPlayer")]
    public decimal? MaxMonthlyBonusValuePerPlayer { get; set; }

    /// <summary>
    /// Maximum number of active bonuses a player can have at once.
    /// Null means unlimited.
    /// </summary>
    [BsonElement("maxActiveBonusesPerPlayer")]
    public int? MaxActiveBonusesPerPlayer { get; set; }

    /// <summary>
    /// Currency for value-based limits (e.g., USD, EUR).
    /// </summary>
    [BsonElement("currency")]
    [BsonRequired]
    public string Currency { get; set; } = "USD";

    /// <summary>
    /// Timestamp when the settings were created (UTC).
    /// </summary>
    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when the settings were last updated (UTC).
    /// </summary>
    [BsonElement("updatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
