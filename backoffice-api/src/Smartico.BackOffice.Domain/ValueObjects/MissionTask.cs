using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Smartico.BackOffice.Domain.ValueObjects;

/// <summary>
/// Represents a single task within a mission.
/// Each task has a trigger (what starts tracking), goal (what to achieve),
/// and optional bonus template reward (granted when this specific task is completed).
/// </summary>
public record MissionTask
{
    /// <summary>
    /// Unique identifier for this task within the mission.
    /// </summary>
    [BsonElement("id")]
    public string Id { get; init; } = Guid.NewGuid().ToString();

    /// <summary>
    /// Display name for this task.
    /// </summary>
    [BsonElement("name")]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Optional description of what this task requires.
    /// </summary>
    [BsonElement("description")]
    public string? Description { get; init; }

    /// <summary>
    /// Order of this task in the mission (for display purposes).
    /// Tasks can be completed in any order unless explicitly configured otherwise.
    /// </summary>
    [BsonElement("order")]
    public int Order { get; init; }

    /// <summary>
    /// Trigger condition that starts tracking progress for this task.
    /// </summary>
    [BsonElement("trigger")]
    public TaskTrigger Trigger { get; init; } = new();

    /// <summary>
    /// Goal that must be achieved to complete this task.
    /// </summary>
    [BsonElement("goal")]
    public TaskGoal Goal { get; init; } = new();

    /// <summary>
    /// Optional bonus template to grant when this specific task is completed.
    /// If null, no bonus is granted for this task (only mission completion points apply).
    /// </summary>
    [BsonElement("bonusTemplateId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId? BonusTemplateId { get; init; }
}

/// <summary>
/// Trigger condition for a mission task.
/// Defines what player action starts tracking progress toward the goal.
/// </summary>
public record TaskTrigger
{
    /// <summary>
    /// Type of event that triggers this task.
    /// </summary>
    [BsonElement("type")]
    [BsonRepresentation(BsonType.String)]
    public TriggerType Type { get; init; }

    /// <summary>
    /// Minimum amount for amount-based triggers (e.g., min bet of $10).
    /// </summary>
    [BsonElement("minAmount")]
    public decimal? MinAmount { get; init; }

    /// <summary>
    /// Specific game ID if trigger is game-specific.
    /// </summary>
    [BsonElement("gameId")]
    public string? GameId { get; init; }
}

/// <summary>
/// Goal definition for a mission task.
/// Defines what the player must achieve to complete this task.
/// </summary>
public record TaskGoal
{
    /// <summary>
    /// Type of goal (what player needs to do).
    /// </summary>
    [BsonElement("type")]
    [BsonRepresentation(BsonType.String)]
    public GoalType Type { get; init; }

    /// <summary>
    /// Target count for count-based goals (e.g., make 10 bets).
    /// </summary>
    [BsonElement("targetCount")]
    public int? TargetCount { get; init; }

    /// <summary>
    /// Target amount for amount-based goals (e.g., wager $100).
    /// </summary>
    [BsonElement("targetAmount")]
    public decimal? TargetAmount { get; init; }

    /// <summary>
    /// List of game IDs that count toward the goal. Empty/null means all games.
    /// </summary>
    [BsonElement("eligibleGames")]
    public List<string>? EligibleGames { get; init; }
}
