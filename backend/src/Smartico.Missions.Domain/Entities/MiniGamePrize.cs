using Smartico.Missions.Domain.Enums;

namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents a prize within a mini game.
/// Maps to TMiniGamePrize from Smartico API.
/// </summary>
public class MiniGamePrize
{
    /// <summary>
    /// Unique identifier for the prize.
    /// </summary>
    public required int Id { get; init; }

    /// <summary>
    /// Display name of the prize.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Type of prize (NO_PRIZE, POINTS, BONUS, etc.).
    /// </summary>
    public required MiniGamePrizeType PrizeType { get; init; }

    /// <summary>
    /// Numeric value of the prize (for POINTS, SPIN, GEMS_AND_DIAMONDS).
    /// Null for prize types without numeric value.
    /// </summary>
    public decimal? PrizeValue { get; init; }

    /// <summary>
    /// URL to the prize icon.
    /// </summary>
    public string? Icon { get; init; }

    /// <summary>
    /// Number of prizes remaining in stock.
    /// Null if unlimited or not tracked.
    /// </summary>
    public int? Pool { get; set; }

    /// <summary>
    /// Initial pool size for reference.
    /// </summary>
    public int? PoolInitial { get; init; }

    /// <summary>
    /// Total number of times this prize has been won.
    /// </summary>
    public int? WinsCount { get; set; }

    /// <summary>
    /// Message displayed when user wins this prize.
    /// </summary>
    public string? AcknowledgeMessage { get; init; }

    /// <summary>
    /// Deep link URL for action button (e.g., "Go to Bonuses").
    /// </summary>
    public string? AcknowledgeDp { get; init; }

    /// <summary>
    /// Text for action button (e.g., "Claim Now").
    /// </summary>
    public string? AcknowledgeActionTitle { get; init; }

    /// <summary>
    /// Message shown when prize pool is depleted.
    /// </summary>
    public string? OutOfStockMessage { get; init; }

    /// <summary>
    /// If true, prize is always available regardless of pool count.
    /// </summary>
    public required bool IsSurcharge { get; init; }

    /// <summary>
    /// If true, hide this prize from user's prize history.
    /// </summary>
    public required bool HidePrizeFromHistory { get; init; }

    /// <summary>
    /// Checks if the prize is available (in stock or surcharge).
    /// </summary>
    public bool IsAvailable()
    {
        if (IsSurcharge)
            return true;

        if (!Pool.HasValue)
            return true; // Unlimited

        return Pool.Value > 0;
    }
}
