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
    /// Gets or sets the visual rule structure defining the mission flow.
    /// </summary>
    [JsonPropertyName("rule")]
    public MissionRule Rule { get; set; } = new();

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
