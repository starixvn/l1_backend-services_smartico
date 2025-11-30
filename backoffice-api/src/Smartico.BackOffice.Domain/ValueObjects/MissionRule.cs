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
    /// Type of trigger (BetPlaced, DepositMade, GamePlayed, BonusActivated).
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
    /// Type of goal (CountBased, TurnoverAmount, etc.).
    /// </summary>
    [BsonElement("goalType")]
    [BsonRepresentation(MongoDB.Bson.BsonType.String)]
    public GoalType? GoalType { get; init; }

    /// <summary>
    /// Target count for count-based goals (e.g., complete 5 times).
    /// </summary>
    [BsonElement("goalCount")]
    public int? GoalCount { get; init; }

    /// <summary>
    /// List of game IDs that count toward the goal. Empty means all games.
    /// </summary>
    [BsonElement("eligibleGames")]
    public List<string>? EligibleGames { get; init; }

    // Reward node properties (simplified - only BonusTemplate is supported)
    /// <summary>
    /// Reference to a bonus template ID.
    /// When the task is completed, this bonus template will be issued to the player.
    /// Optional - if not set, no bonus is granted for this specific task.
    /// </summary>
    [BsonElement("bonusTemplateId")]
    [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
    public MongoDB.Bson.ObjectId? BonusTemplateId { get; init; }

    // Legacy fields - kept for backward compatibility, will be removed
    [BsonElement("rewardType")]
    [BsonRepresentation(MongoDB.Bson.BsonType.String)]
    [BsonIgnoreIfNull]
    public RewardType? RewardType { get; init; }

    [BsonElement("rewardAmount")]
    [BsonIgnoreIfNull]
    public decimal? RewardAmount { get; init; }

    [BsonElement("pointsAmount")]
    [BsonIgnoreIfNull]
    public int? PointsAmount { get; init; }
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
    GamePlayed,

    /// <summary>
    /// Mission triggers when player logs in (daily login tracking).
    /// </summary>
    DailyLogin
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
    CountBased,

    /// <summary>
    /// Goal is to complete turnover requirements (wager X times the locked amount).
    /// Used for bonus-linked missions to release locked balance.
    /// </summary>
    TurnoverAmount,

    /// <summary>
    /// Goal is to reach a certain number of logins (for daily login missions).
    /// </summary>
    LoginCount
}

/// <summary>
/// Types of rewards for mission task completion.
/// NOTE: FreeSpins, CashBonus, and Points have been removed.
/// - FreeSpins and CashBonus should be configured via Bonus Templates
/// - Points are now a mission-level field (completionPoints)
/// </summary>
public enum RewardType
{
    /// <summary>
    /// Reward is a bonus template (issues a bonus from the Bonus Templates system).
    /// The task references a bonus template by ID, which will be issued to the player upon task completion.
    /// </summary>
    BonusTemplate
}

// ====================================================================================
// EXECUTION MODEL - Generated from visual rule when mission is published
// ====================================================================================

/// <summary>
/// Execution model for mission processing.
/// This is generated from the visual MissionRule when a mission is published.
/// The mission processing service uses this structure to execute missions.
/// </summary>
public record MissionExecutionRule
{
    /// <summary>
    /// Trigger condition that activates this mission for players.
    /// </summary>
    [BsonElement("trigger")]
    public TriggerCondition Trigger { get; init; } = new();

    /// <summary>
    /// Sequential list of goals that must be completed in order.
    /// </summary>
    [BsonElement("goals")]
    public List<GoalStep> Goals { get; init; } = new();

    /// <summary>
    /// Reward to be granted upon mission completion.
    /// </summary>
    [BsonElement("reward")]
    public RewardDefinition Reward { get; init; } = new();
}

/// <summary>
/// Defines what event triggers a mission to become available to a player.
/// </summary>
public record TriggerCondition
{
    /// <summary>
    /// Type of event that triggers the mission.
    /// </summary>
    [BsonElement("type")]
    [BsonRepresentation(MongoDB.Bson.BsonType.String)]
    public TriggerType Type { get; init; }

    /// <summary>
    /// Minimum amount for amount-based triggers (e.g., min bet $10).
    /// </summary>
    [BsonElement("minAmount")]
    public decimal? MinAmount { get; init; }

    /// <summary>
    /// List of game IDs that qualify for this trigger. Empty/null means all games.
    /// Example: ["wukong", "candy-land"] means only bets on these games count.
    /// </summary>
    [BsonElement("eligibleGames")]
    public List<string>? EligibleGames { get; init; }
}

/// <summary>
/// Defines a single goal/step that must be completed.
/// </summary>
public record GoalStep
{
    /// <summary>
    /// Order in which this goal must be completed (1-based).
    /// </summary>
    [BsonElement("order")]
    public int Order { get; init; }

    /// <summary>
    /// Type of goal (what player needs to do).
    /// </summary>
    [BsonElement("type")]
    [BsonRepresentation(MongoDB.Bson.BsonType.String)]
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
    /// Specific game ID if goal is game-specific.
    /// </summary>
    [BsonElement("gameId")]
    public string? GameId { get; init; }

    /// <summary>
    /// List of game IDs that count toward the goal. Empty means all games.
    /// </summary>
    [BsonElement("eligibleGames")]
    public List<string>? EligibleGames { get; init; }
}

/// <summary>
/// Defines the reward granted upon task completion.
/// SIMPLIFIED: Now only supports BonusTemplate.
/// Points are handled at mission level (completionPoints).
/// FreeSpins/CashBonus are configured via Bonus Templates.
/// </summary>
public record RewardDefinition
{
    /// <summary>
    /// Reference to a bonus template ID.
    /// When the task is completed, this bonus template will be issued to the player.
    /// </summary>
    [BsonElement("bonusTemplateId")]
    [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
    public MongoDB.Bson.ObjectId? BonusTemplateId { get; init; }

    // Legacy fields - kept for backward compatibility during migration
    [BsonElement("type")]
    [BsonRepresentation(MongoDB.Bson.BsonType.String)]
    [BsonIgnoreIfNull]
    public RewardType? Type { get; init; }

    [BsonElement("amount")]
    [BsonIgnoreIfNull]
    public decimal? Amount { get; init; }

    [BsonElement("gameId")]
    [BsonIgnoreIfNull]
    public string? GameId { get; init; }

    [BsonElement("pointsAmount")]
    [BsonIgnoreIfNull]
    public int? PointsAmount { get; init; }
}
