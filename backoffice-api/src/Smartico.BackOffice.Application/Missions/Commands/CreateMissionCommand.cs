using System.Text.Json.Serialization;
using Smartico.BackOffice.Application.Missions.DTOs;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Missions.Commands;

/// <summary>
/// Command to create a new mission.
/// </summary>
public class CreateMissionCommand
{
    /// <summary>
    /// Gets or sets the name of the mission.
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the optional description of the mission.
    /// </summary>
    [JsonPropertyName("description")]
    public string? Description { get; set; }

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
    /// DEPRECATED: Use Tasks instead.
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
    /// Gets or sets the mission start date and time.
    /// </summary>
    [JsonPropertyName("startDate")]
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Gets or sets the mission end date and time.
    /// </summary>
    [JsonPropertyName("endDate")]
    public DateTime EndDate { get; set; }
}
