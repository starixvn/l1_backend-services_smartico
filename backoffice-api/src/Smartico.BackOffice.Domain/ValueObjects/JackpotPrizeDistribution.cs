using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Domain.ValueObjects;

/// <summary>
/// Represents prize distribution configuration for a jackpot.
/// Defines how prizes are distributed when jackpot is won.
/// </summary>
public class JackpotPrizeDistribution
{
    /// <summary>
    /// Type of distribution (WinnerTakesAll, SplitAmongWinners, or ProportionalToWager).
    /// </summary>
    [BsonElement("distributionType")]
    [BsonRepresentation(BsonType.String)]
    public PrizeDistributionType DistributionType { get; set; } = PrizeDistributionType.WinnerTakesAll;

    /// <summary>
    /// Maximum number of winners for split distribution.
    /// Applicable for SplitAmongWinners and ProportionalToWager.
    /// </summary>
    [BsonElement("maxWinners")]
    [BsonIgnoreIfNull]
    public int? MaxWinners { get; set; }

    /// <summary>
    /// Custom split percentages for each winner position (e.g., [50, 30, 20]).
    /// Sum should equal 100. If not provided, prize is split equally.
    /// Only applicable when DistributionType is SplitAmongWinners.
    /// </summary>
    [BsonElement("winnerPercentages")]
    [BsonIgnoreIfNull]
    public List<decimal>? WinnerPercentages { get; set; }

    /// <summary>
    /// Minimum wager amount required to qualify for prize distribution.
    /// Only applicable when DistributionType is ProportionalToWager.
    /// </summary>
    [BsonElement("minimumWagerToQualify")]
    [BsonIgnoreIfNull]
    public decimal? MinimumWagerToQualify { get; set; }

    /// <summary>
    /// Maximum percentage a single player can receive (cap to prevent monopoly).
    /// E.g., 50 means no single player can get more than 50% of the prize.
    /// Only applicable when DistributionType is ProportionalToWager.
    /// </summary>
    [BsonElement("maxPercentagePerPlayer")]
    [BsonIgnoreIfNull]
    public decimal? MaxPercentagePerPlayer { get; set; }
}
