namespace Smartico.Missions.Domain.Enums;

/// <summary>
/// Tournament prize types determining how rewards are distributed.
/// </summary>
public enum TournamentPrizeType
{
    /// <summary>
    /// Points-based prize - awards gamification points.
    /// </summary>
    Points = 0,

    /// <summary>
    /// Bonus template trigger - activates a bonus for the winner.
    /// </summary>
    Bonus = 1,

    /// <summary>
    /// Manual prize - requires manual intervention/fulfillment.
    /// </summary>
    Manual = 2,

    /// <summary>
    /// Real money prize.
    /// </summary>
    RealMoney = 3,

    /// <summary>
    /// Free spins prize (for gaming platforms).
    /// </summary>
    FreeSpins = 4,

    /// <summary>
    /// Custom prize type defined by operator.
    /// </summary>
    Custom = 99
}
