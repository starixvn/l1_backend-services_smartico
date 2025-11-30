using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Smartico.BackOffice.Domain.Entities;

/// <summary>
/// Status of a badge series.
/// </summary>
public enum BadgeSeriesStatus
{
    /// <summary>
    /// Series is being configured.
    /// </summary>
    Draft,

    /// <summary>
    /// Series is active and visible to players.
    /// </summary>
    Active,

    /// <summary>
    /// Series is archived.
    /// </summary>
    Archived
}

/// <summary>
/// Represents a thematic grouping of related badges (e.g., "Slots Master", "High Roller").
/// Operator-scoped: Each operator creates their own badge series.
/// </summary>
public class BadgeSeries : IOperatorScoped
{
    /// <summary>
    /// Unique identifier for the badge series.
    /// </summary>
    [BsonId]
    [BsonElement("_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    /// <summary>
    /// Operator (casino/game provider) that owns this badge series.
    /// Used for multi-tenant data isolation.
    /// </summary>
    [BsonElement("operatorId")]
    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId OperatorId { get; set; }

    /// <summary>
    /// Series name displayed to players (e.g., "Slots Master", "High Roller", "Tournament Champion").
    /// </summary>
    [BsonElement("name")]
    [BsonRequired]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional description of the badge series.
    /// </summary>
    [BsonElement("description")]
    public string? Description { get; set; }

    /// <summary>
    /// URL or path to the series icon/image.
    /// </summary>
    [BsonElement("iconUrl")]
    public string? IconUrl { get; set; }

    /// <summary>
    /// Display order for ordering series in UI (lower = shown first).
    /// </summary>
    [BsonElement("displayOrder")]
    public int DisplayOrder { get; set; } = 0;

    /// <summary>
    /// Current status of the badge series.
    /// </summary>
    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public BadgeSeriesStatus Status { get; set; } = BadgeSeriesStatus.Draft;

    /// <summary>
    /// Timestamp when the series was created (UTC).
    /// </summary>
    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when the series was last updated (UTC).
    /// </summary>
    [BsonElement("updatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
