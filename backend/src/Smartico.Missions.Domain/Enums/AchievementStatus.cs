namespace Smartico.Missions.Domain.Enums;

/// <summary>
/// Status of an achievement (Mission or Badge).
/// Mirrors AchievementStatus from @smartico/public-api
/// </summary>
public enum AchievementStatus
{
    /// <summary>
    /// Available to opt-in
    /// </summary>
    Available = 0,

    /// <summary>
    /// Currently active (opted in)
    /// </summary>
    Active = 1,

    /// <summary>
    /// Completed successfully
    /// </summary>
    Completed = 2,

    /// <summary>
    /// Expired (time-limited mission)
    /// </summary>
    Expired = 3,

    /// <summary>
    /// Locked (not yet available)
    /// </summary>
    Locked = 4,

    /// <summary>
    /// Reward claimed
    /// </summary>
    Claimed = 5
}

