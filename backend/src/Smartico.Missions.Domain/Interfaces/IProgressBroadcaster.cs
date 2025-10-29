using Smartico.Missions.Domain.Entities;

namespace Smartico.Missions.Domain.Interfaces;

/// <summary>
/// Interface for broadcasting real-time progress updates to clients.
/// </summary>
public interface IProgressBroadcaster
{
    /// <summary>
    /// Broadcasts mission progress update to a specific user.
    /// </summary>
    /// <param name="userId">User ID to send update to</param>
    /// <param name="mission">Updated mission data</param>
    /// <returns>Completion task</returns>
    Task BroadcastMissionProgressAsync(string userId, Mission mission);

    /// <summary>
    /// Broadcasts mission completion to a specific user.
    /// </summary>
    /// <param name="userId">User ID to send update to</param>
    /// <param name="mission">Completed mission data</param>
    /// <returns>Completion task</returns>
    Task BroadcastMissionCompletedAsync(string userId, Mission mission);

    /// <summary>
    /// Broadcasts badge earned notification to a specific user.
    /// </summary>
    /// <param name="userId">User ID to send update to</param>
    /// <param name="badge">Earned badge data</param>
    /// <returns>Completion task</returns>
    Task BroadcastBadgeEarnedAsync(string userId, Badge badge);
}

