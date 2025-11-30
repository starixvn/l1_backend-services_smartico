using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Smartico.BackOffice.Domain.ValueObjects;

/// <summary>
/// Types of rewards that can be granted when a badge is unlocked.
/// </summary>
public enum BadgeRewardType
{
    /// <summary>
    /// Badge only - no additional reward (prestige).
    /// </summary>
    None,

    /// <summary>
    /// XP earning multiplier for a duration.
    /// </summary>
    XpBoost,

    /// <summary>
    /// Free spin credits.
    /// </summary>
    FreeSpins,

    /// <summary>
    /// Cash/credit bonus.
    /// </summary>
    Cash,

    /// <summary>
    /// Reference to an existing bonus template.
    /// </summary>
    BonusTemplate
}

/// <summary>
/// Represents the reward configuration for a badge.
/// Defines what reward (if any) is granted when the badge is unlocked.
/// </summary>
public class BadgeReward
{
    /// <summary>
    /// Type of reward.
    /// </summary>
    [BsonElement("type")]
    [BsonRepresentation(BsonType.String)]
    public BadgeRewardType Type { get; set; } = BadgeRewardType.None;

    /// <summary>
    /// Value of the reward:
    /// - For Cash: monetary amount
    /// - For FreeSpins: number of spins
    /// - For XpBoost: multiplier (e.g., 1.5 for 50% boost)
    /// </summary>
    [BsonElement("value")]
    [BsonIgnoreIfNull]
    public decimal? Value { get; set; }

    /// <summary>
    /// Duration in hours for XpBoost reward type.
    /// Valid range: 1-168 hours (1 hour to 1 week).
    /// </summary>
    [BsonElement("durationHours")]
    [BsonIgnoreIfNull]
    public int? DurationHours { get; set; }

    /// <summary>
    /// Game ID for FreeSpins reward (optional).
    /// If null, free spins can be used on any game.
    /// </summary>
    [BsonElement("gameId")]
    [BsonIgnoreIfNull]
    public string? GameId { get; set; }

    /// <summary>
    /// Bonus template ID for BonusTemplate reward type.
    /// </summary>
    [BsonElement("bonusTemplateId")]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonIgnoreIfNull]
    public ObjectId? BonusTemplateId { get; set; }

    /// <summary>
    /// Optional description of the reward for display purposes.
    /// </summary>
    [BsonElement("description")]
    [BsonIgnoreIfNull]
    public string? Description { get; set; }
}
