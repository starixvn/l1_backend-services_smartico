using System.Text.Json.Serialization;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Application.Badges.DTOs;

/// <summary>
/// Data transfer object for badge information.
/// </summary>
public class BadgeDto
{
    /// <summary>
    /// Unique identifier for the badge.
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Operator ID that owns this badge.
    /// </summary>
    [JsonPropertyName("operatorId")]
    public string OperatorId { get; set; } = string.Empty;

    /// <summary>
    /// Badge name displayed to players.
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional description of the badge.
    /// </summary>
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    /// <summary>
    /// URL or path to the badge icon/image.
    /// </summary>
    [JsonPropertyName("iconUrl")]
    public string? IconUrl { get; set; }

    /// <summary>
    /// Rarity level (common, rare, epic, legendary).
    /// </summary>
    [JsonPropertyName("rarity")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public BadgeRarity Rarity { get; set; }

    /// <summary>
    /// Current status of the badge.
    /// </summary>
    [JsonPropertyName("status")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public BadgeStatus Status { get; set; }

    /// <summary>
    /// Unlock criteria configuration.
    /// </summary>
    [JsonPropertyName("unlockCriteria")]
    public BadgeUnlockCriteriaDto UnlockCriteria { get; set; } = new();

    /// <summary>
    /// Optional reward configuration.
    /// </summary>
    [JsonPropertyName("reward")]
    public BadgeRewardDto? Reward { get; set; }

    /// <summary>
    /// Whether the badge criteria is hidden until unlocked.
    /// </summary>
    [JsonPropertyName("isHidden")]
    public bool IsHidden { get; set; }

    /// <summary>
    /// Whether to show progress tracking to players.
    /// </summary>
    [JsonPropertyName("progressTrackingEnabled")]
    public bool ProgressTrackingEnabled { get; set; }

    /// <summary>
    /// Optional badge series ID for grouping.
    /// </summary>
    [JsonPropertyName("seriesId")]
    public string? SeriesId { get; set; }

    /// <summary>
    /// Display order within the series.
    /// </summary>
    [JsonPropertyName("orderInSeries")]
    public int OrderInSeries { get; set; }

    /// <summary>
    /// Count of players who have unlocked this badge.
    /// </summary>
    [JsonPropertyName("unlockCount")]
    public int UnlockCount { get; set; }

    /// <summary>
    /// Timestamp when the badge was created.
    /// </summary>
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the badge was last updated.
    /// </summary>
    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}
