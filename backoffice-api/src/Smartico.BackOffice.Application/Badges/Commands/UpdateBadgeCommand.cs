using System.Text.Json.Serialization;
using Smartico.BackOffice.Application.Badges.DTOs;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Application.Badges.Commands;

/// <summary>
/// Command to update an existing badge.
/// </summary>
public class UpdateBadgeCommand
{
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
}
