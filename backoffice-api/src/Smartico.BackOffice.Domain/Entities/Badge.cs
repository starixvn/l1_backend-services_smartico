using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Domain.Entities;

/// <summary>
/// Rarity levels for badges, affecting prestige and display styling.
/// </summary>
public enum BadgeRarity
{
    /// <summary>
    /// Common badge - easily attainable.
    /// </summary>
    Common,

    /// <summary>
    /// Rare badge - requires moderate effort.
    /// </summary>
    Rare,

    /// <summary>
    /// Epic badge - requires significant achievement.
    /// </summary>
    Epic,

    /// <summary>
    /// Legendary badge - extremely difficult to obtain.
    /// </summary>
    Legendary
}

/// <summary>
/// Status of a badge.
/// </summary>
public enum BadgeStatus
{
    /// <summary>
    /// Badge is being configured, not visible to players.
    /// </summary>
    Draft,

    /// <summary>
    /// Badge is active and can be earned by players.
    /// </summary>
    Active,

    /// <summary>
    /// Badge is archived, no longer earnable but still visible if unlocked.
    /// </summary>
    Archived
}

/// <summary>
/// Represents an achievement badge with unlock criteria and rewards.
/// Operator-scoped: Each operator creates their own badges.
/// </summary>
public class Badge : IOperatorScoped
{
    /// <summary>
    /// Unique identifier for the badge.
    /// </summary>
    [BsonId]
    [BsonElement("_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    /// <summary>
    /// Operator (casino/game provider) that owns this badge.
    /// Used for multi-tenant data isolation.
    /// </summary>
    [BsonElement("operatorId")]
    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId OperatorId { get; set; }

    /// <summary>
    /// Badge name displayed to players.
    /// </summary>
    [BsonElement("name")]
    [BsonRequired]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional description of the badge and how to earn it.
    /// </summary>
    [BsonElement("description")]
    public string? Description { get; set; }

    /// <summary>
    /// URL or path to the badge icon/image.
    /// </summary>
    [BsonElement("iconUrl")]
    public string? IconUrl { get; set; }

    /// <summary>
    /// Rarity level affecting prestige and display styling.
    /// </summary>
    [BsonElement("rarity")]
    [BsonRepresentation(BsonType.String)]
    public BadgeRarity Rarity { get; set; } = BadgeRarity.Common;

    /// <summary>
    /// Current status of the badge.
    /// </summary>
    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public BadgeStatus Status { get; set; } = BadgeStatus.Draft;

    /// <summary>
    /// Unlock criteria that defines what players must achieve.
    /// </summary>
    [BsonElement("unlockCriteria")]
    [BsonRequired]
    public BadgeUnlockCriteria UnlockCriteria { get; set; } = new();

    /// <summary>
    /// Optional reward granted when the badge is unlocked.
    /// </summary>
    [BsonElement("reward")]
    public BadgeReward? Reward { get; set; }

    /// <summary>
    /// Whether the badge criteria is hidden until unlocked (surprise/discovery).
    /// </summary>
    [BsonElement("isHidden")]
    public bool IsHidden { get; set; } = false;

    /// <summary>
    /// Whether to show progress tracking to players (e.g., "32/50 complete").
    /// </summary>
    [BsonElement("progressTrackingEnabled")]
    public bool ProgressTrackingEnabled { get; set; } = true;

    /// <summary>
    /// Optional badge series/collection ID for thematic grouping.
    /// </summary>
    [BsonElement("seriesId")]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonIgnoreIfNull]
    public ObjectId? SeriesId { get; set; }

    /// <summary>
    /// Display order within the series (lower = shown first).
    /// </summary>
    [BsonElement("orderInSeries")]
    public int OrderInSeries { get; set; } = 0;

    /// <summary>
    /// Count of players who have unlocked this badge (analytics).
    /// Updated by the badge achievement engine.
    /// </summary>
    [BsonElement("unlockCount")]
    public int UnlockCount { get; set; } = 0;

    /// <summary>
    /// User ID of the creator.
    /// </summary>
    [BsonElement("createdBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonIgnoreIfNull]
    public ObjectId? CreatedBy { get; set; }

    /// <summary>
    /// Timestamp when the badge was created (UTC).
    /// </summary>
    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when the badge was last updated (UTC).
    /// </summary>
    [BsonElement("updatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
