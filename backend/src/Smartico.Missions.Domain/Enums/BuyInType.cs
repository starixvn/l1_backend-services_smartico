namespace Smartico.Missions.Domain.Enums;

/// <summary>
/// Types of buy-in requirements for mini games.
/// Maps to SAWBuyInTypeName from Smartico API.
/// </summary>
public enum BuyInType
{
    /// <summary>
    /// Free to play (no cost).
    /// </summary>
    Free = 0,

    /// <summary>
    /// Costs gamification points.
    /// </summary>
    Points = 1,

    /// <summary>
    /// Costs gems currency.
    /// </summary>
    Gems = 2,

    /// <summary>
    /// Costs diamonds currency.
    /// </summary>
    Diamonds = 3,

    /// <summary>
    /// Costs a spin attempt.
    /// </summary>
    Spin = 4
}
