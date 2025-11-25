using MongoDB.Bson.Serialization.Attributes;

namespace Smartico.BackOffice.Domain.ValueObjects;

/// <summary>
/// Represents the visual rule structure for a mission.
/// Contains nodes (blocks) and edges (connections) from the drag-and-drop rule builder.
/// </summary>
public record MissionRule
{
    /// <summary>
    /// List of rule nodes (trigger, goal, reward blocks) in the visual builder.
    /// </summary>
    [BsonElement("nodes")]
    public List<RuleNode> Nodes { get; init; } = new();

    /// <summary>
    /// List of connections (edges) between nodes in the visual builder.
    /// </summary>
    [BsonElement("edges")]
    public List<RuleEdge> Edges { get; init; } = new();
}

/// <summary>
/// Represents a single node (block) in the visual rule builder.
/// </summary>
public record RuleNode
{
    /// <summary>
    /// Unique identifier for this node.
    /// </summary>
    [BsonElement("id")]
    public string Id { get; init; } = string.Empty;

    /// <summary>
    /// Type of node (trigger, goal, reward).
    /// </summary>
    [BsonElement("type")]
    [BsonRepresentation(MongoDB.Bson.BsonType.String)]
    public NodeType Type { get; init; }

    /// <summary>
    /// Position of the node on the canvas (x, y coordinates).
    /// </summary>
    [BsonElement("position")]
    public NodePosition Position { get; init; } = new();

    /// <summary>
    /// Configuration data for this node.
    /// </summary>
    [BsonElement("data")]
    public NodeData Data { get; init; } = new();
}

/// <summary>
/// Represents a connection (edge) between two nodes.
/// </summary>
public record RuleEdge
{
    /// <summary>
    /// Unique identifier for this edge.
    /// </summary>
    [BsonElement("id")]
    public string Id { get; init; } = string.Empty;

    /// <summary>
    /// Source node ID (where the connection starts).
    /// </summary>
    [BsonElement("source")]
    public string Source { get; init; } = string.Empty;

    /// <summary>
    /// Target node ID (where the connection ends).
    /// </summary>
    [BsonElement("target")]
    public string Target { get; init; } = string.Empty;

    /// <summary>
    /// Optional label for the edge.
    /// </summary>
    [BsonElement("label")]
    public string? Label { get; init; }
}

/// <summary>
/// Position of a node on the canvas.
/// </summary>
public record NodePosition
{
    /// <summary>
    /// X coordinate.
    /// </summary>
    [BsonElement("x")]
    public double X { get; init; }

    /// <summary>
    /// Y coordinate.
    /// </summary>
    [BsonElement("y")]
    public double Y { get; init; }
}

/// <summary>
/// Configuration data for a rule node.
/// </summary>
public record NodeData
{
    /// <summary>
    /// Display label for the node.
    /// </summary>
    [BsonElement("label")]
    public string? Label { get; init; }

    // Trigger node properties
    /// <summary>
    /// Type of trigger (BetPlaced, DepositMade, GamePlayed).
    /// </summary>
    [BsonElement("triggerType")]
    [BsonRepresentation(MongoDB.Bson.BsonType.String)]
    public TriggerType? TriggerType { get; init; }

    /// <summary>
    /// Minimum threshold for the trigger (e.g., minimum bet amount).
    /// </summary>
    [BsonElement("triggerThreshold")]
    public decimal? TriggerThreshold { get; init; }

    /// <summary>
    /// Specific game ID for GamePlayed triggers (optional).
    /// </summary>
    [BsonElement("gameId")]
    public string? GameId { get; init; }

    // Goal node properties
    /// <summary>
    /// Type of goal (CountBased).
    /// </summary>
    [BsonElement("goalType")]
    [BsonRepresentation(MongoDB.Bson.BsonType.String)]
    public GoalType? GoalType { get; init; }

    /// <summary>
    /// Target count for count-based goals (e.g., complete 5 times).
    /// </summary>
    [BsonElement("goalCount")]
    public int? GoalCount { get; init; }

    // Reward node properties
    /// <summary>
    /// Type of reward (FreeSpins, CashBonus).
    /// </summary>
    [BsonElement("rewardType")]
    [BsonRepresentation(MongoDB.Bson.BsonType.String)]
    public RewardType? RewardType { get; init; }

    /// <summary>
    /// Amount of the reward.
    /// </summary>
    [BsonElement("rewardAmount")]
    public decimal? RewardAmount { get; init; }
}

/// <summary>
/// Types of nodes in the visual rule builder.
/// </summary>
public enum NodeType
{
    /// <summary>
    /// Trigger node (action that starts the mission).
    /// </summary>
    Trigger,

    /// <summary>
    /// Goal node (completion criteria).
    /// </summary>
    Goal,

    /// <summary>
    /// Reward node (what player receives upon completion).
    /// </summary>
    Reward
}

/// <summary>
/// Types of triggers that can activate a mission.
/// </summary>
public enum TriggerType
{
    /// <summary>
    /// Mission triggers when player places a bet.
    /// </summary>
    BetPlaced,

    /// <summary>
    /// Mission triggers when player makes a deposit.
    /// </summary>
    DepositMade,

    /// <summary>
    /// Mission triggers when player plays a game.
    /// </summary>
    GamePlayed
}

/// <summary>
/// Types of goals for mission completion.
/// </summary>
public enum GoalType
{
    /// <summary>
    /// Goal is to reach a certain number of bets/spins.
    /// </summary>
    BetCount,

    /// <summary>
    /// Goal is to reach a certain total deposit amount.
    /// </summary>
    DepositAmount,

    /// <summary>
    /// Goal is to reach a certain total wagered amount.
    /// </summary>
    WageredAmount,

    /// <summary>
    /// Generic count-based goal (legacy, use BetCount instead).
    /// </summary>
    CountBased
}

/// <summary>
/// Types of rewards for mission completion.
/// </summary>
public enum RewardType
{
    /// <summary>
    /// Reward is free spins.
    /// </summary>
    FreeSpins,

    /// <summary>
    /// Reward is cash bonus.
    /// </summary>
    CashBonus
}
