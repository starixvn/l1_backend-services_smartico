namespace Smartico.Missions.Domain.Enums;

/// <summary>
/// Type of achievement (Mission or Badge).
/// Mirrors AchievementType from @smartico/public-api
/// </summary>
public enum AchievementType
{
    /// <summary>
    /// Mission: Task-based achievement with multiple steps
    /// </summary>
    Mission = 1,

    /// <summary>
    /// Badge: Collectible achievement earned by completing specific actions
    /// </summary>
    Badge = 2
}

