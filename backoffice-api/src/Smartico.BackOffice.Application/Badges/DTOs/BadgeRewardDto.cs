using System.Text.Json.Serialization;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Badges.DTOs;

/// <summary>
/// Data transfer object for badge reward configuration.
/// </summary>
public class BadgeRewardDto
{
    /// <summary>
    /// Type of reward.
    /// </summary>
    [JsonPropertyName("type")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public BadgeRewardType Type { get; set; } = BadgeRewardType.None;

    /// <summary>
    /// Value of the reward (amount for Cash, count for FreeSpins, multiplier for XpBoost).
    /// </summary>
    [JsonPropertyName("value")]
    public decimal? Value { get; set; }

    /// <summary>
    /// Duration in hours for XpBoost reward type (1-168 hours).
    /// </summary>
    [JsonPropertyName("durationHours")]
    public int? DurationHours { get; set; }

    /// <summary>
    /// Game ID for FreeSpins reward (optional).
    /// </summary>
    [JsonPropertyName("gameId")]
    public string? GameId { get; set; }

    /// <summary>
    /// Bonus template ID for BonusTemplate reward type.
    /// </summary>
    [JsonPropertyName("bonusTemplateId")]
    public string? BonusTemplateId { get; set; }

    /// <summary>
    /// Optional description of the reward.
    /// </summary>
    [JsonPropertyName("description")]
    public string? Description { get; set; }
}
