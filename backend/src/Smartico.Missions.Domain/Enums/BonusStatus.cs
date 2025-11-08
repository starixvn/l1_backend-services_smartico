namespace Smartico.Missions.Domain.Enums;

/// <summary>
/// Represents the lifecycle status of a bonus
/// </summary>
public enum BonusStatus
{
    /// <summary>
    /// Bonus has been created but not yet issued to user
    /// </summary>
    New = 1,

    /// <summary>
    /// Bonus has been issued to user and is available for claiming
    /// </summary>
    Issued = 2,

    /// <summary>
    /// Bonus has been successfully claimed by user
    /// </summary>
    Claimed = 3,

    /// <summary>
    /// Bonus claim attempt failed (user can retry)
    /// </summary>
    RedeemFailed = 4,

    /// <summary>
    /// Bonus issue attempt failed
    /// </summary>
    IssueFailed = 5,

    /// <summary>
    /// Bonus has expired and is no longer claimable
    /// </summary>
    Expired = 6
}
