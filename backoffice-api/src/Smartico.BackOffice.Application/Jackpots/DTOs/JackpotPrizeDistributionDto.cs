using System.Text.Json.Serialization;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Application.Jackpots.DTOs;

/// <summary>
/// Data transfer object for jackpot prize distribution configuration.
/// </summary>
public class JackpotPrizeDistributionDto
{
    /// <summary>
    /// Type of distribution (WinnerTakesAll, SplitAmongWinners, ProportionalToWager).
    /// </summary>
    [JsonPropertyName("distributionType")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public PrizeDistributionType DistributionType { get; set; } = PrizeDistributionType.WinnerTakesAll;

    /// <summary>
    /// Maximum number of winners for split distribution.
    /// Applicable for SplitAmongWinners and ProportionalToWager.
    /// </summary>
    [JsonPropertyName("maxWinners")]
    public int? MaxWinners { get; set; }

    /// <summary>
    /// Custom split percentages for each winner position.
    /// Only applicable for SplitAmongWinners.
    /// </summary>
    [JsonPropertyName("winnerPercentages")]
    public List<decimal>? WinnerPercentages { get; set; }

    /// <summary>
    /// Minimum wager amount required to qualify for prize distribution.
    /// Only applicable for ProportionalToWager.
    /// </summary>
    [JsonPropertyName("minimumWagerToQualify")]
    public decimal? MinimumWagerToQualify { get; set; }

    /// <summary>
    /// Maximum percentage a single player can receive (cap).
    /// Only applicable for ProportionalToWager.
    /// </summary>
    [JsonPropertyName("maxPercentagePerPlayer")]
    public decimal? MaxPercentagePerPlayer { get; set; }
}
