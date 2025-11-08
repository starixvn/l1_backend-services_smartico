namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents a user's current position in the leveling system and progress toward next level.
/// </summary>
public class UserLevelProgress
{
    /// <summary>
    /// ID of the user's current level.
    /// </summary>
    public required int CurrentLevelId { get; init; }

    /// <summary>
    /// Name of the current level (user-facing, translated).
    /// </summary>
    public required string CurrentLevelName { get; init; }

    /// <summary>
    /// Image URL of the current level badge.
    /// </summary>
    public required string CurrentLevelImage { get; init; }

    /// <summary>
    /// Total points accumulated by the user (ach_points_ever from user properties).
    /// </summary>
    public required int TotalPointsEarned { get; init; }

    /// <summary>
    /// Points required to reach the current level.
    /// </summary>
    public required int CurrentLevelRequiredPoints { get; init; }

    /// <summary>
    /// ID of the next achievable level (null if user is at max level).
    /// </summary>
    public int? NextLevelId { get; init; }

    /// <summary>
    /// Name of the next level (null if at max level).
    /// </summary>
    public string? NextLevelName { get; init; }

    /// <summary>
    /// Points required to reach the next level (null if at max level).
    /// </summary>
    public int? NextLevelRequiredPoints { get; init; }

    /// <summary>
    /// Points still needed to advance to next level.
    /// Calculated as: NextLevelRequiredPoints - TotalPointsEarned
    /// </summary>
    public int? PointsToNextLevel { get; init; }

    /// <summary>
    /// Percentage progress toward next level (0-100).
    /// Calculated as: ((TotalPointsEarned - CurrentLevelRequiredPoints) / (NextLevelRequiredPoints - CurrentLevelRequiredPoints)) * 100
    /// Null if at max level.
    /// </summary>
    public decimal? ProgressPercentage { get; init; }

    /// <summary>
    /// Current value of level counter 1 (advanced leveling).
    /// Null if advanced leveling not enabled.
    /// </summary>
    public int? LevelCounter1Current { get; init; }

    /// <summary>
    /// Required value of level counter 1 for next level (advanced leveling).
    /// Null if advanced leveling not enabled or at max level.
    /// </summary>
    public int? LevelCounter1Required { get; init; }

    /// <summary>
    /// Current value of level counter 2 (advanced leveling).
    /// Null if advanced leveling not enabled.
    /// </summary>
    public int? LevelCounter2Current { get; init; }

    /// <summary>
    /// Required value of level counter 2 for next level (advanced leveling).
    /// Null if advanced leveling not enabled or at max level.
    /// </summary>
    public int? LevelCounter2Required { get; init; }

    /// <summary>
    /// Indicates whether the user is at the maximum level.
    /// </summary>
    public bool IsMaxLevel => NextLevelId == null;

    /// <summary>
    /// Factory method to create UserLevelProgress with calculated progress percentage.
    /// </summary>
    /// <param name="currentLevel">User's current level</param>
    /// <param name="nextLevel">Next level to achieve (null if at max)</param>
    /// <param name="totalPointsEarned">Total points accumulated by user</param>
    /// <param name="counter1Current">Current value of level counter 1 (advanced leveling)</param>
    /// <param name="counter2Current">Current value of level counter 2 (advanced leveling)</param>
    /// <returns>UserLevelProgress with calculated percentage</returns>
    public static UserLevelProgress Create(
        Level currentLevel,
        Level? nextLevel,
        int totalPointsEarned,
        int? counter1Current = null,
        int? counter2Current = null)
    {
        decimal? progressPercentage = null;
        int? pointsToNext = null;

        if (nextLevel != null)
        {
            var pointsInCurrentLevel = totalPointsEarned - currentLevel.RequiredPoints;
            var pointsNeededForNextLevel = nextLevel.RequiredPoints - currentLevel.RequiredPoints;

            if (pointsNeededForNextLevel > 0)
            {
                progressPercentage = Math.Round(
                    (decimal)pointsInCurrentLevel / pointsNeededForNextLevel * 100,
                    2
                );

                // Clamp to 0-100 range
                progressPercentage = Math.Max(0, Math.Min(100, progressPercentage.Value));
            }

            pointsToNext = nextLevel.RequiredPoints - totalPointsEarned;
        }

        return new UserLevelProgress
        {
            CurrentLevelId = currentLevel.Id,
            CurrentLevelName = currentLevel.Name,
            CurrentLevelImage = currentLevel.Image,
            TotalPointsEarned = totalPointsEarned,
            CurrentLevelRequiredPoints = currentLevel.RequiredPoints,
            NextLevelId = nextLevel?.Id,
            NextLevelName = nextLevel?.Name,
            NextLevelRequiredPoints = nextLevel?.RequiredPoints,
            PointsToNextLevel = pointsToNext,
            ProgressPercentage = progressPercentage,
            LevelCounter1Current = counter1Current,
            LevelCounter1Required = nextLevel?.RequiredLevelCounter1,
            LevelCounter2Current = counter2Current,
            LevelCounter2Required = nextLevel?.RequiredLevelCounter2
        };
    }
}
