namespace Smartico.Missions.Domain.Enums;

/// <summary>
/// Types of prizes that can be won in mini games.
/// Maps to MiniGamePrizeTypeName from Smartico API.
/// </summary>
public enum MiniGamePrizeType
{
    /// <summary>
    /// No prize awarded ("Better luck next time").
    /// </summary>
    NoPrize = 0,

    /// <summary>
    /// Gamification points awarded.
    /// </summary>
    Points = 1,

    /// <summary>
    /// Triggers a bonus template.
    /// </summary>
    Bonus = 2,

    /// <summary>
    /// Requires manual operator intervention.
    /// </summary>
    Manual = 3,

    /// <summary>
    /// Additional spin attempts awarded.
    /// </summary>
    Spin = 4,

    /// <summary>
    /// Jackpot prize awarded (resets jackpot).
    /// </summary>
    Jackpot = 5,

    /// <summary>
    /// Triggers level progression.
    /// </summary>
    ChangeLevel = 6,

    /// <summary>
    /// Unlocks a mission for the user.
    /// </summary>
    Mission = 7,

    /// <summary>
    /// Raffle ticket for future drawing.
    /// </summary>
    RaffleTicket = 8,

    /// <summary>
    /// Gems and/or diamonds awarded.
    /// </summary>
    GemsAndDiamonds = 9,

    /// <summary>
    /// Unknown/fallback prize type.
    /// </summary>
    Unknown = 10
}
