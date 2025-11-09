using Smartico.Missions.Domain.Enums;

namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents a specific instance of a jackpot pot with current pool amount and temperature.
/// Each time a jackpot explodes (draws winners), a new pot instance is created.
/// </summary>
public record JackpotPot
{
    /// <summary>
    /// Unique identifier for this pot instance.
    /// </summary>
    public required int JpPotId { get; init; }

    /// <summary>
    /// Foreign key to parent jackpot template.
    /// </summary>
    public required int JpTemplateId { get; init; }

    /// <summary>
    /// Current pool amount in jackpot's base currency.
    /// Grows as users contribute through bets.
    /// </summary>
    public required decimal CurrentPotAmount { get; init; }

    /// <summary>
    /// Current pool amount converted to user's wallet currency.
    /// Pre-calculated for display purposes.
    /// </summary>
    public required decimal CurrentPotAmountUserCurrency { get; init; }

    /// <summary>
    /// Heat level of the pool (COLD/WARM/HOT/BURNING).
    /// Calculated based on current pot vs min/max thresholds.
    /// </summary>
    public required JackPotTemperature CurrentPotTemperature { get; init; }

    /// <summary>
    /// Unix timestamp (milliseconds) when this pot exploded or will explode.
    /// Used for explosion countdown timers.
    /// </summary>
    public required long ExploseDateTs { get; init; }
}
