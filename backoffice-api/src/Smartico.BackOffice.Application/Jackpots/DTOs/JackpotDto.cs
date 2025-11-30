using System.Text.Json.Serialization;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Application.Jackpots.DTOs;

/// <summary>
/// Data transfer object for jackpot information.
/// </summary>
public class JackpotDto
{
    /// <summary>
    /// Unique identifier for the jackpot.
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Operator ID that owns this jackpot.
    /// </summary>
    [JsonPropertyName("operatorId")]
    public string OperatorId { get; set; } = string.Empty;

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
    public JackpotType Type { get; set; }

    /// <summary>
    /// Current status of the jackpot.
    /// </summary>
    [JsonPropertyName("status")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public JackpotStatus Status { get; set; }

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
    public JackpotResetBehavior ResetBehavior { get; set; }

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

    /// <summary>
    /// Lifetime total contributions to this jackpot.
    /// </summary>
    [JsonPropertyName("totalContributions")]
    public decimal TotalContributions { get; set; }

    /// <summary>
    /// Lifetime total payouts from this jackpot.
    /// </summary>
    [JsonPropertyName("totalPayouts")]
    public decimal TotalPayouts { get; set; }

    /// <summary>
    /// Timestamp when jackpot was last won.
    /// </summary>
    [JsonPropertyName("lastWonAt")]
    public DateTime? LastWonAt { get; set; }

    /// <summary>
    /// Player ID of the last winner.
    /// </summary>
    [JsonPropertyName("lastWinnerPlayerId")]
    public string? LastWinnerPlayerId { get; set; }

    /// <summary>
    /// Amount won in the last win.
    /// </summary>
    [JsonPropertyName("lastWinAmount")]
    public decimal? LastWinAmount { get; set; }

    /// <summary>
    /// Timestamp when the jackpot was created.
    /// </summary>
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the jackpot was last updated.
    /// </summary>
    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}
