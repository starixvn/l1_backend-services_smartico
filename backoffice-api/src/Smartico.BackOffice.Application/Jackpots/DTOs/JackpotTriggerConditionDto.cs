using System.Text.Json.Serialization;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Jackpots.DTOs;

/// <summary>
/// Data transfer object for jackpot trigger condition configuration.
/// </summary>
public class JackpotTriggerConditionDto
{
    /// <summary>
    /// Type of trigger (Random, ValueBased, TimeBased, AmountBased).
    /// </summary>
    [JsonPropertyName("triggerType")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public JackpotTriggerType TriggerType { get; set; } = JackpotTriggerType.Random;

    /// <summary>
    /// Probability for Random trigger (e.g., 0.0001 = 0.01%).
    /// </summary>
    [JsonPropertyName("probability")]
    public decimal? Probability { get; set; }

    /// <summary>
    /// Minimum bet amount for ValueBased trigger.
    /// </summary>
    [JsonPropertyName("betThreshold")]
    public decimal? BetThreshold { get; set; }

    /// <summary>
    /// Time interval for TimeBased trigger (Hourly, Daily, Weekly).
    /// </summary>
    [JsonPropertyName("timeInterval")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public JackpotTimeInterval? TimeInterval { get; set; }

    /// <summary>
    /// Specific time of day for drops (HH:mm format, UTC).
    /// </summary>
    [JsonPropertyName("timeOfDay")]
    public string? TimeOfDay { get; set; }

    /// <summary>
    /// Target jackpot amount that triggers the drop.
    /// Only applicable when TriggerType is AmountBased.
    /// </summary>
    [JsonPropertyName("triggerAmount")]
    public decimal? TriggerAmount { get; set; }
}
