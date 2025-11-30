using System.Text.Json.Serialization;
using Smartico.BackOffice.Application.Jackpots.DTOs;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Application.Jackpots.Commands;

/// <summary>
/// Command to update an existing jackpot.
/// Only allowed when jackpot is in Draft status.
/// </summary>
public class UpdateJackpotCommand
{
    /// <summary>
    /// Jackpot ID to update.
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Jackpot name displayed to players.
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional description of the jackpot.
    /// </summary>
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Type of jackpot (Progressive, Fixed).
    /// </summary>
    [JsonPropertyName("type")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public JackpotType Type { get; set; } = JackpotType.Progressive;

    /// <summary>
    /// Jackpot tiers configuration.
    /// </summary>
    [JsonPropertyName("tiers")]
    public List<JackpotTierDto> Tiers { get; set; } = new();

    /// <summary>
    /// Game IDs that contribute to this jackpot.
    /// </summary>
    [JsonPropertyName("eligibleGames")]
    public List<string> EligibleGames { get; set; } = new();

    /// <summary>
    /// Prize distribution configuration.
    /// </summary>
    [JsonPropertyName("prizeDistribution")]
    public JackpotPrizeDistributionDto PrizeDistribution { get; set; } = new();

    /// <summary>
    /// Reset behavior when jackpot is won.
    /// </summary>
    [JsonPropertyName("resetBehavior")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public JackpotResetBehavior ResetBehavior { get; set; } = JackpotResetBehavior.ResetToSeed;

    /// <summary>
    /// Currency code for jackpot values.
    /// </summary>
    [JsonPropertyName("currency")]
    public string Currency { get; set; } = "USD";

    /// <summary>
    /// Optional start date for the jackpot.
    /// </summary>
    [JsonPropertyName("startDate")]
    public DateTime? StartDate { get; set; }

    /// <summary>
    /// Optional end date for the jackpot.
    /// </summary>
    [JsonPropertyName("endDate")]
    public DateTime? EndDate { get; set; }
}
