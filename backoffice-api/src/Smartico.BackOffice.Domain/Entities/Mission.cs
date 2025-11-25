using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Domain.Entities;

/// <summary>
/// Represents a mission campaign with visual rule-based configuration.
/// Missions define player actions (triggers), completion goals, and rewards.
/// </summary>
public class Mission : IOperatorScoped
{
    /// <summary>
    /// Unique identifier for the mission.
    /// </summary>
    [BsonId]
    [BsonElement("_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    /// <summary>
    /// Operator (casino/game provider) that owns this mission.
    /// Used for multi-tenant data isolation.
    /// </summary>
    [BsonElement("operatorId")]
    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId OperatorId { get; set; }

    /// <summary>
    /// Mission name displayed to operators and players.
    /// </summary>
    [BsonElement("name")]
    [BsonRequired]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional detailed description of the mission.
    /// </summary>
    [BsonElement("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Current status of the mission (Draft, Active, Completed, Cancelled).
    /// </summary>
    [BsonElement("status")]
    [BsonRequired]
    [BsonRepresentation(BsonType.String)]
    public MissionStatus Status { get; set; } = MissionStatus.Draft;

    /// <summary>
    /// Visual rule structure defining the mission flow (triggers, goals, rewards).
    /// Stored as a graph of nodes and connections from the visual builder.
    /// </summary>
    [BsonElement("rule")]
    [BsonRequired]
    public MissionRule Rule { get; set; } = new();

    /// <summary>
    /// Player segment that can participate in this mission.
    /// </summary>
    [BsonElement("targetSegment")]
    [BsonRequired]
    [BsonRepresentation(BsonType.String)]
    public PlayerSegment TargetSegment { get; set; } = PlayerSegment.AllPlayers;

    /// <summary>
    /// Mission start date and time (UTC).
    /// </summary>
    [BsonElement("startDate")]
    [BsonRequired]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Mission end date and time (UTC).
    /// </summary>
    [BsonElement("endDate")]
    [BsonRequired]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime EndDate { get; set; }

    /// <summary>
    /// Timestamp when the mission was created (UTC).
    /// </summary>
    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when the mission was last updated (UTC).
    /// </summary>
    [BsonElement("updatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
