namespace Smartico.Missions.Domain.Enums;

/// <summary>
/// Represents different types of bonuses available
/// </summary>
public enum BonusType
{
    /// <summary>
    /// Welcome bonus for new users
    /// </summary>
    WelcomeBonus = 1,

    /// <summary>
    /// Bonus triggered by user deposit
    /// </summary>
    DepositBonus = 2,

    /// <summary>
    /// Free spins for slot games
    /// </summary>
    FreeSpins = 3,

    /// <summary>
    /// Cash back on losses
    /// </summary>
    CashBack = 4,

    /// <summary>
    /// Reload bonus for existing users
    /// </summary>
    Reload = 5,

    /// <summary>
    /// VIP exclusive bonus
    /// </summary>
    VIPBonus = 6
}
