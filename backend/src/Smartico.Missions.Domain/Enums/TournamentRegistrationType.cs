namespace Smartico.Missions.Domain.Enums;

/// <summary>
/// Tournament registration type determining entry requirements and costs.
/// </summary>
public enum TournamentRegistrationType
{
    /// <summary>
    /// Free entry - no cost to register.
    /// </summary>
    Free = 0,

    /// <summary>
    /// Paid entry using gamification points.
    /// </summary>
    PaidPoints = 1,

    /// <summary>
    /// Paid entry using gems currency.
    /// </summary>
    PaidGems = 2,

    /// <summary>
    /// Paid entry using diamonds currency.
    /// </summary>
    PaidDiamonds = 3,

    /// <summary>
    /// Invite-only entry - requires special access/invitation.
    /// </summary>
    InviteOnly = 4
}
