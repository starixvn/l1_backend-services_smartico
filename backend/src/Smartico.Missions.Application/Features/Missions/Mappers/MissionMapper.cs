using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Enums;
using BackOfficeMission = Smartico.BackOffice.Domain.Entities.Mission;
using BackOfficeMissionTask = Smartico.BackOffice.Domain.ValueObjects.MissionTask;

namespace Smartico.Missions.Application.Features.Missions.Mappers;

/// <summary>
/// Maps BackOffice Mission entities to API DTO responses.
/// Converts MongoDB entities to player-facing mission details.
/// </summary>
public static class MissionMapper
{
    /// <summary>
    /// Converts a BackOffice Mission entity to a Mission DTO.
    /// </summary>
    /// <param name="mission">The mission entity from MongoDB.</param>
    /// <param name="progress">Player's progress percentage (0-100).</param>
    /// <param name="status">Player's mission status.</param>
    /// <param name="taskProgress">Progress for each task (taskId -> currentValue).</param>
    /// <returns>The mapped Mission DTO.</returns>
    public static Mission ToDto(
        BackOfficeMission mission,
        decimal progress = 0,
        AchievementStatus status = AchievementStatus.Available,
        Dictionary<string, int>? taskProgress = null)
    {
        var tasks = mission.Tasks
            .Select(t => MapTask(t, taskProgress?.GetValueOrDefault(t.Id, 0) ?? 0))
            .ToList();

        return new Mission
        {
            Id = mission.Id.GetHashCode(), // Use hash as int ID for compatibility
            Name = mission.Name,
            Description = mission.Description ?? string.Empty,
            ImageUrl = $"https://images.example.com/missions/{mission.Id}.png",
            Type = AchievementType.Mission,
            Status = status,
            Progress = progress,
            Tasks = tasks,
            RewardAmount = mission.CompletionXp,
            RewardCurrency = "XP",
            ExpiresAt = mission.EndDate,
            IsRecurring = false, // TODO: Support recurring missions
            CompletionCount = 0, // TODO: Get from PlayerProgress
            Category = mission.TargetSegment.ToString(),
            RelatedGames = Array.Empty<string>() // TODO: Parse from rule if needed
        };
    }

    /// <summary>
    /// Maps a BackOffice MissionTask to a Domain MissionTask DTO.
    /// </summary>
    private static MissionTask MapTask(BackOfficeMissionTask task, int currentValue)
    {
        // Get target value from Goal (uses TargetCount for count-based goals)
        var targetValue = task.Goal.TargetCount ?? 1;
        var progress = CalculateProgress(currentValue, targetValue);

        return new MissionTask
        {
            Id = task.Id,
            Description = task.Name, // BackOffice uses Name, Domain uses Description
            CurrentValue = currentValue,
            TargetValue = targetValue,
            Progress = progress,
            IsCompleted = progress >= 100,
            Order = task.Order
        };
    }

    /// <summary>
    /// Calculates progress percentage (0-100) from current and target values.
    /// </summary>
    /// <param name="currentValue">Current progress value.</param>
    /// <param name="targetValue">Target value for completion.</param>
    /// <returns>Progress percentage (0-100).</returns>
    public static decimal CalculateProgress(int currentValue, int targetValue)
    {
        if (targetValue <= 0)
        {
            return currentValue > 0 ? 100m : 0m;
        }

        var progress = (decimal)currentValue / targetValue * 100;
        return Math.Min(100m, Math.Max(0m, progress));
    }
}
