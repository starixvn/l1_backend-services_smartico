using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Domain.ValueObjects;

/// <summary>
/// Time interval for time-based jackpot drops.
/// </summary>
public enum JackpotTimeInterval
{
    /// <summary>
    /// Drops once per hour.
    /// </summary>
    Hourly,

    /// <summary>
    /// Drops once per day.
    /// </summary>
    Daily,

    /// <summary>
    /// Drops once per week.
    /// </summary>
    Weekly
}

/// <summary>
/// Represents the trigger condition configuration for a jackpot tier.
/// Defines when and how the jackpot can be won.
/// </summary>
public class JackpotTriggerCondition
{
    /// <summary>
    /// Type of trigger (Random, ValueBased, TimeBased, AmountBased).
    /// </summary>
    [BsonElement("triggerType")]
    [BsonRepresentation(BsonType.String)]
    public JackpotTriggerType TriggerType { get; set; } = JackpotTriggerType.Random;

    /// <summary>
    /// Probability for Random trigger (e.g., 0.0001 = 0.01%).
    /// Only applicable when TriggerType is Random.
    /// </summary>
    [BsonElement("probability")]
    [BsonIgnoreIfNull]
    public decimal? Probability { get; set; }

    /// <summary>
    /// Minimum bet amount to qualify for ValueBased trigger.
    /// Only applicable when TriggerType is ValueBased.
    /// </summary>
    [BsonElement("betThreshold")]
    [BsonIgnoreIfNull]
    public decimal? BetThreshold { get; set; }

    /// <summary>
    /// Time interval for TimeBased trigger drops.
    /// Only applicable when TriggerType is TimeBased.
    /// </summary>
    [BsonElement("timeInterval")]
    [BsonRepresentation(BsonType.String)]
    [BsonIgnoreIfNull]
    public JackpotTimeInterval? TimeInterval { get; set; }

    /// <summary>
    /// Specific time of day for drops (HH:mm format, UTC).
    /// Used with TimeBased trigger for scheduled drops.
    /// </summary>
    [BsonElement("timeOfDay")]
    [BsonIgnoreIfNull]
    public string? TimeOfDay { get; set; }

    /// <summary>
    /// Target jackpot amount that triggers the drop.
    /// Only applicable when TriggerType is AmountBased.
    /// When the jackpot value reaches this amount, it will be triggered.
    /// </summary>
    [BsonElement("triggerAmount")]
    [BsonIgnoreIfNull]
    public decimal? TriggerAmount { get; set; }
}
