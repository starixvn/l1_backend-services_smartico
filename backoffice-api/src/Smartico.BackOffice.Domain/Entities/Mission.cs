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
    /// XP awarded to player when ALL tasks in this mission are completed.
    /// This XP contributes directly to the player's level progression.
    /// Bonus templates on tasks are optional additional rewards.
    /// </summary>
    [BsonElement("completionXp")]
    public int CompletionXp { get; set; }

    /// <summary>
    /// List of tasks that must be completed to finish this mission.
    /// Each task has a trigger, goal, and optional bonus template reward.
    /// </summary>
    [BsonElement("tasks")]
    [BsonIgnoreIfNull]
    public List<MissionTask> Tasks { get; set; } = new();

    /// <summary>
    /// Visual rule structure defining the mission flow (triggers, goals, rewards).
    /// Stored as a graph of nodes and connections from the visual builder.
    /// DEPRECATED: Will be removed after migration to task-based system.
    /// </summary>
    [BsonElement("rule")]
    public MissionRule? Rule { get; set; }

    /// <summary>
    /// Execution-ready rule structure generated when mission is published.
    /// Linear format optimized for mission processing service.
    /// Only populated for Active missions.
    /// </summary>
    [BsonElement("executionRule")]
    public MissionExecutionRule? ExecutionRule { get; set; }

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

