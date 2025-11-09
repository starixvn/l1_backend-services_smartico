using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Enums;

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

    // ========== TOURNAMENT EVENTS ==========

    /// <summary>
    /// Broadcasts that a user registered for a tournament.
    /// Frontend event: "TournamentRegistered"
    /// </summary>
    /// <param name="userId">Unique identifier of the user</param>
    /// <param name="tournament">The tournament that was registered for</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completion task</returns>
    Task BroadcastTournamentRegisteredAsync(string userId, Tournament tournament, CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts that a tournament leaderboard was updated.
    /// Frontend event: "TournamentLeaderboardUpdated"
    /// </summary>
    /// <param name="tournamentInstanceId">Tournament instance identifier</param>
    /// <param name="participants">Updated leaderboard participants</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completion task</returns>
    Task BroadcastTournamentLeaderboardUpdatedAsync(int tournamentInstanceId, List<TournamentParticipant> participants, CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts that a tournament status changed.
    /// Frontend event: "TournamentStatusChanged"
    /// </summary>
    /// <param name="tournament">The tournament with updated status</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completion task</returns>
    Task BroadcastTournamentStatusChangedAsync(Tournament tournament, CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts that a tournament finished and prizes were awarded.
    /// Frontend event: "TournamentPrizeWon"
    /// </summary>
    /// <param name="userId">Unique identifier of the user who won</param>
    /// <param name="tournament">The tournament that finished</param>
    /// <param name="prize">The prize that was won</param>
    /// <param name="finalPosition">User's final position in tournament</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completion task</returns>
    Task BroadcastTournamentPrizeWonAsync(string userId, Tournament tournament, TournamentPrize prize, int finalPosition, CancellationToken cancellationToken = default);

    // ========== LEVEL EVENTS ==========

    /// <summary>
    /// Broadcasts that a user's level progress was updated (points earned, progress percentage changed).
    /// Frontend event: "LevelProgressUpdated"
    /// </summary>
    /// <param name="userId">Unique identifier of the user</param>
    /// <param name="progress">Updated level progress data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completion task</returns>
    Task BroadcastLevelProgressUpdatedAsync(string userId, UserLevelProgress progress, CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts that a user achieved a new level (level-up event).
    /// Frontend event: "LevelUpAchieved"
    /// </summary>
    /// <param name="userId">Unique identifier of the user</param>
    /// <param name="newLevel">The new level that was reached</param>
    /// <param name="previousLevel">The previous level (null if leveling up from level 0)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completion task</returns>
    Task BroadcastLevelUpAchievedAsync(string userId, Level newLevel, Level? previousLevel, CancellationToken cancellationToken = default);

    // ========== JACKPOT EVENTS ==========

    /// <summary>
    /// Broadcasts that a jackpot pool was updated (amount changed, registration count changed).
    /// Sent to all connected clients. Frontend event: "JackpotPoolUpdated"
    /// </summary>
    /// <param name="templateId">Jackpot template ID</param>
    /// <param name="currentPotJp">Current pot amount in jackpot currency</param>
    /// <param name="currentPotUser">Current pot amount in user currency</param>
    /// <param name="registrationCount">Current number of opted-in users</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completion task</returns>
    Task BroadcastJackpotPoolUpdatedAsync(
        int templateId,
        decimal currentPotJp,
        decimal currentPotUser,
        int registrationCount,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts that a jackpot temperature changed (COLD/WARM/HOT/BURNING).
    /// Sent to all connected clients. Frontend event: "JackpotTemperatureChanged"
    /// </summary>
    /// <param name="templateId">Jackpot template ID</param>
    /// <param name="temperature">New temperature state</param>
    /// <param name="currentPot">Current pot amount</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completion task</returns>
    Task BroadcastJackpotTemperatureChangedAsync(
        int templateId,
        JackPotTemperature temperature,
        decimal currentPot,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts that a jackpot exploded and winners were drawn.
    /// Sent to all connected clients. Frontend event: "JackpotExploded"
    /// </summary>
    /// <param name="templateId">Jackpot template ID</param>
    /// <param name="jackpotName">Name of the jackpot</param>
    /// <param name="finalPot">Final pot amount before explosion</param>
    /// <param name="winnerCount">Number of winners drawn</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completion task</returns>
    Task BroadcastJackpotExplodedAsync(
        int templateId,
        string jackpotName,
        decimal finalPot,
        int winnerCount,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts that a jackpot winner was announced.
    /// Sent to all connected clients. Frontend event: "JackpotWinnerAnnounced"
    /// </summary>
    /// <param name="templateId">Jackpot template ID</param>
    /// <param name="jackpotName">Name of the jackpot</param>
    /// <param name="winner">The jackpot winner details</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completion task</returns>
    Task BroadcastJackpotWinnerAnnouncedAsync(
        int templateId,
        string jackpotName,
        JackpotWinner winner,
        CancellationToken cancellationToken = default);
}

