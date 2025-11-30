using System.Text.Json.Serialization;

namespace Smartico.BackOffice.Application.Jackpots.DTOs;

/// <summary>
/// Data transfer object for jackpot tier configuration.
/// </summary>
public class JackpotTierDto
{
    /// <summary>
    /// Unique identifier for this tier.
    /// </summary>
    [JsonPropertyName("tierId")]
    public string TierId { get; set; } = string.Empty;

    /// <summary>
    /// Display name for this tier (e.g., Mini, Minor, Major, Grand).
    /// </summary>
    [JsonPropertyName("tierName")]
    public string TierName { get; set; } = string.Empty;

    /// <summary>
    /// Initial value after jackpot reset.
    /// </summary>
    [JsonPropertyName("seedAmount")]
    public decimal SeedAmount { get; set; }

    /// <summary>
    /// Percentage of bet that contributes to this tier (e.g., 0.005 = 0.5%).
    /// </summary>
    [JsonPropertyName("contributionRate")]
    public decimal ContributionRate { get; set; }

    /// <summary>
    /// Maximum value cap to prevent runaway growth.
    /// </summary>
    [JsonPropertyName("maxValue")]
    public decimal? MaxValue { get; set; }

    /// <summary>
    /// Current live value of this tier.
    /// </summary>
    [JsonPropertyName("currentValue")]
    public decimal CurrentValue { get; set; }

    /// <summary>
    /// Trigger condition for this tier.
    /// </summary>
    [JsonPropertyName("triggerCondition")]
    public JackpotTriggerConditionDto TriggerCondition { get; set; } = new();

    /// <summary>
    /// Display order for this tier.
    /// </summary>
    [JsonPropertyName("displayOrder")]
    public int DisplayOrder { get; set; }
}
