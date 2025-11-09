namespace Smartico.Missions.Domain.Enums;

/// <summary>
/// Defines how users contribute to a jackpot pool during gameplay.
/// </summary>
public enum JackpotContributionType
{
    /// <summary>
    /// Fixed amount per bet (e.g., 10 points per bet).
    /// User contributes the exact same amount with each bet, regardless of bet size.
    /// </summary>
    Fixed = 1,

    /// <summary>
    /// Percentage of bet amount (e.g., 5% of each bet).
    /// User contributes a percentage of their bet amount, scaling with bet size.
    /// </summary>
    Percentage = 2
}
