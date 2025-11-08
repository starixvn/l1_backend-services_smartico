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

    // ========== MINI GAME EVENTS ==========

    /// <summary>
    /// Broadcasts that a user played a mini game.
    /// Frontend event: "MiniGamePlayed"
    /// </summary>
    /// <param name="userId">Unique identifier of the user</param>
    /// <param name="game">The mini game that was played</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completion task</returns>
    Task BroadcastMiniGamePlayedAsync(string userId, MiniGame game, CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts that a user won a prize in a mini game.
    /// Frontend event: "MiniGamePrizeWon"
    /// </summary>
    /// <param name="userId">Unique identifier of the user</param>
    /// <param name="game">The mini game where prize was won</param>
    /// <param name="prize">The prize that was won</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completion task</returns>
    Task BroadcastMiniGamePrizeWonAsync(string userId, MiniGame game, MiniGamePrize prize, CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts that a user won the jackpot (sent to all connected clients).
    /// Frontend event: "MiniGameJackpotWon"
    /// </summary>
    /// <param name="userId">Unique identifier of the user who won</param>
    /// <param name="game">The mini game where jackpot was won</param>
    /// <param name="jackpotAmount">The jackpot amount won</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completion task</returns>
    Task BroadcastMiniGameJackpotWonAsync(string userId, MiniGame game, decimal jackpotAmount, CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts that a prize pool has been updated (sent to all connected clients).
    /// Frontend event: "MiniGamePoolUpdated"
    /// </summary>
    /// <param name="gameId">ID of the mini game</param>
    /// <param name="prizeId">ID of the prize</param>
    /// <param name="remainingPool">Remaining items in pool</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completion task</returns>
    Task BroadcastMiniGamePoolUpdatedAsync(int gameId, int prizeId, int remainingPool, CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts that a new mini game became available to the user.
    /// Frontend event: "MiniGameAvailable"
    /// </summary>
    /// <param name="userId">Unique identifier of the user</param>
    /// <param name="game">The mini game that became available</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completion task</returns>
    Task BroadcastMiniGameAvailableAsync(string userId, MiniGame game, CancellationToken cancellationToken = default);
}

