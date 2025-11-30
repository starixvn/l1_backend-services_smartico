using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Smartico.BackOffice.Domain.ValueObjects;

/// <summary>
/// Represents a tier within a jackpot (e.g., Mini, Minor, Major, Grand).
/// Each tier has its own configuration for seed, contribution, cap, and trigger.
/// </summary>
public class JackpotTier
{
    /// <summary>
    /// Unique identifier for this tier within the jackpot.
    /// </summary>
    [BsonElement("tierId")]
    public string TierId { get; set; } = Guid.NewGuid().ToString();

    /// <summary>
    /// Display name for this tier (e.g., Mini, Minor, Major, Grand, or custom).
    /// </summary>
    [BsonElement("tierName")]
    public string TierName { get; set; } = string.Empty;

    /// <summary>
    /// Initial value after jackpot reset.
    /// </summary>
    [BsonElement("seedAmount")]
    public decimal SeedAmount { get; set; }

    /// <summary>
    /// Percentage of bet that contributes to this tier (e.g., 0.005 = 0.5%).
    /// Only applicable for Progressive jackpots.
    /// </summary>
    [BsonElement("contributionRate")]
    public decimal ContributionRate { get; set; }

    /// <summary>
    /// Maximum value cap to prevent runaway growth.
    /// </summary>
    [BsonElement("maxValue")]
    [BsonIgnoreIfNull]
    public decimal? MaxValue { get; set; }

    /// <summary>
    /// Current live value of this tier.
    /// Updated as contributions are made.
    /// </summary>
    [BsonElement("currentValue")]
    public decimal CurrentValue { get; set; }

    /// <summary>
    /// Trigger condition specific to this tier.
    /// </summary>
    [BsonElement("triggerCondition")]
    public JackpotTriggerCondition TriggerCondition { get; set; } = new();

    /// <summary>
    /// Display order for this tier (lower = shown first).
    /// </summary>
    [BsonElement("displayOrder")]
    public int DisplayOrder { get; set; }
}
