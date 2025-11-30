using System.Text.Json.Serialization;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Application.Badges.DTOs;

/// <summary>
/// Data transfer object for badge series information.
/// </summary>
public class BadgeSeriesDto
{
    /// <summary>
    /// Unique identifier for the badge series.
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Operator ID that owns this series.
    /// </summary>
    [JsonPropertyName("operatorId")]
    public string OperatorId { get; set; } = string.Empty;

    /// <summary>
    /// Series name displayed to players.
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional description of the series.
    /// </summary>
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    /// <summary>
    /// URL or path to the series icon/image.
    /// </summary>
    [JsonPropertyName("iconUrl")]
    public string? IconUrl { get; set; }

    /// <summary>
    /// Display order for ordering series in UI.
    /// </summary>
    [JsonPropertyName("displayOrder")]
    public int DisplayOrder { get; set; }

    /// <summary>
    /// Current status of the series.
    /// </summary>
    [JsonPropertyName("status")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public BadgeSeriesStatus Status { get; set; }

    /// <summary>
    /// Badges in this series.
    /// </summary>
    [JsonPropertyName("badges")]
    public List<BadgeDto>? Badges { get; set; }

    /// <summary>
    /// Timestamp when the series was created.
    /// </summary>
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the series was last updated.
    /// </summary>
    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}
