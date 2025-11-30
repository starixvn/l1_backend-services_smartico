using System.Text.Json.Serialization;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Missions.DTOs;

/// <summary>
/// Data transfer object for mission information.
/// </summary>
public class MissionDto
{
    /// <summary>
    /// Gets or sets the mission ID.
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the operator ID.
    /// </summary>
    [JsonPropertyName("operatorId")]
    public string OperatorId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the mission name.
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the optional mission description.
    /// </summary>
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the mission status.
    /// </summary>
    [JsonPropertyName("status")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public MissionStatus Status { get; set; }

    /// <summary>
    /// XP awarded when ALL tasks are completed (contributes to level progression).
    /// </summary>
    [JsonPropertyName("completionXp")]
    public int CompletionXp { get; set; }

    /// <summary>
    /// Gets or sets the list of tasks for this mission.
    /// </summary>
    [JsonPropertyName("tasks")]
    public List<MissionTaskDto> Tasks { get; set; } = new();

    /// <summary>
    /// Gets or sets the visual rule structure defining the mission flow.
    /// DEPRECATED: Use tasks instead.
    /// </summary>
    [JsonPropertyName("rule")]
    public MissionRule? Rule { get; set; }

    /// <summary>
    /// Gets or sets the player segment that can participate in this mission.
    /// </summary>
    [JsonPropertyName("targetSegment")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public PlayerSegment TargetSegment { get; set; }

    /// <summary>
    /// Gets or sets the mission start date.
    /// </summary>
    [JsonPropertyName("startDate")]
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Gets or sets the mission end date.
    /// </summary>
    [JsonPropertyName("endDate")]
    public DateTime EndDate { get; set; }

    /// <summary>
    /// Gets or sets the creation date.
    /// </summary>
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the last update date.
    /// </summary>
    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO for a mission task.
/// </summary>
public class MissionTaskDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("order")]
    public int Order { get; set; }

    [JsonPropertyName("trigger")]
    public TaskTriggerDto Trigger { get; set; } = new();

    [JsonPropertyName("goal")]
    public TaskGoalDto Goal { get; set; } = new();

    [JsonPropertyName("bonusTemplateId")]
    public string? BonusTemplateId { get; set; }

    [JsonPropertyName("bonusTemplateName")]
    public string? BonusTemplateName { get; set; }
}

/// <summary>
/// DTO for task trigger.
/// </summary>
public class TaskTriggerDto
{
    [JsonPropertyName("type")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public TriggerType Type { get; set; }

    [JsonPropertyName("minAmount")]
    public decimal? MinAmount { get; set; }

    /// <summary>
    /// List of game IDs that qualify for this trigger. Empty/null means all games.
    /// Example: ["wukong", "candy-land"] means only bets on these games count.
    /// </summary>
    [JsonPropertyName("eligibleGames")]
    public List<string>? EligibleGames { get; set; }
}

/// <summary>
/// DTO for task goal.
/// </summary>
public class TaskGoalDto
{
    [JsonPropertyName("type")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public GoalType Type { get; set; }

    [JsonPropertyName("targetCount")]
    public int? TargetCount { get; set; }

    [JsonPropertyName("targetAmount")]
    public decimal? TargetAmount { get; set; }

    [JsonPropertyName("eligibleGames")]
    public List<string>? EligibleGames { get; set; }
}
