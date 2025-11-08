using Smartico.Missions.Domain.Entities;

namespace Smartico.Missions.Domain.Interfaces;

/// <summary>
/// Interface for broadcasting real-time gamification updates to clients.
/// Handles Missions, Badges, and Bonuses notifications via SignalR.
/// </summary>
public interface IProgressBroadcaster
{
    // ========== MISSION EVENTS ==========

    /// <summary>
    /// Broadcasts mission progress update to a specific user.
    /// Frontend event: "MissionProgressUpdated"
    /// </summary>
    /// <param name="userId">User ID to send update to</param>
    /// <param name="mission">Updated mission data</param>
    /// <returns>Completion task</returns>
    Task BroadcastMissionProgressAsync(string userId, Mission mission);

    /// <summary>
    /// Broadcasts mission completion to a specific user.
    /// Frontend event: "MissionCompleted"
    /// </summary>
    /// <param name="userId">User ID to send update to</param>
    /// <param name="mission">Completed mission data</param>
    /// <returns>Completion task</returns>
    Task BroadcastMissionCompletedAsync(string userId, Mission mission);

    // ========== BADGE EVENTS ==========

    /// <summary>
    /// Broadcasts badge earned notification to a specific user.
    /// Frontend event: "BadgeEarned"
    /// </summary>
    /// <param name="userId">User ID to send update to</param>
    /// <param name="badge">Earned badge data</param>
    /// <returns>Completion task</returns>
    Task BroadcastBadgeEarnedAsync(string userId, Badge badge);

    // ========== BONUS EVENTS ==========

    /// <summary>
    /// Broadcasts that a new bonus has been issued to a user.
    /// Frontend event: "BonusIssued"
    /// </summary>
    /// <param name="userId">Unique identifier of the user</param>
    /// <param name="bonus">The bonus that was issued</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completion task</returns>
    Task BroadcastBonusIssuedAsync(string userId, Bonus bonus, CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts that a bonus has been successfully claimed.
    /// Frontend event: "BonusClaimed"
    /// </summary>
    /// <param name="userId">Unique identifier of the user</param>
    /// <param name="bonus">The bonus that was claimed</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completion task</returns>
    Task BroadcastBonusClaimedAsync(string userId, Bonus bonus, CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts that a bonus has expired.
    /// Frontend event: "BonusExpired"
    /// </summary>
    /// <param name="userId">Unique identifier of the user</param>
    /// <param name="bonusId">Unique identifier of the expired bonus</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completion task</returns>
    Task BroadcastBonusExpiredAsync(string userId, string bonusId, CancellationToken cancellationToken = default);
}

