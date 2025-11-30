using System.Text.Json.Serialization;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Badges.DTOs;

/// <summary>
/// Data transfer object for badge unlock criteria.
/// </summary>
public class BadgeUnlockCriteriaDto
{
    /// <summary>
    /// Type of unlock criteria.
    /// </summary>
    [JsonPropertyName("type")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public BadgeUnlockCriteriaType Type { get; set; }

    /// <summary>
    /// Threshold value (count or amount depending on criteria type).
    /// </summary>
    [JsonPropertyName("thresholdValue")]
    public decimal ThresholdValue { get; set; }

    /// <summary>
    /// Optional list of game IDs for GamePlayed criteria.
    /// </summary>
    [JsonPropertyName("eligibleGames")]
    public List<string>? EligibleGames { get; set; }

    /// <summary>
    /// Target tier name for TierReached criteria.
    /// </summary>
    [JsonPropertyName("targetTier")]
    public string? TargetTier { get; set; }

    /// <summary>
    /// Custom event name for Custom criteria type.
    /// </summary>
    [JsonPropertyName("customEventName")]
    public string? CustomEventName { get; set; }

    /// <summary>
    /// Optional description of the criteria.
    /// </summary>
    [JsonPropertyName("description")]
    public string? Description { get; set; }
}
