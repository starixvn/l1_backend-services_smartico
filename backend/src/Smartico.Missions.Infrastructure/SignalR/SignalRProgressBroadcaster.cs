using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Infrastructure.SignalR;

/// <summary>
/// SignalR-based implementation of IProgressBroadcaster.
/// Broadcasts real-time gamification updates (Missions, Badges, Bonuses) to connected clients.
/// Note: Uses IHubContext with dynamic Hub type. In production, inject specific hub type.
/// </summary>
public class SignalRProgressBroadcaster : IProgressBroadcaster
{
    private readonly IHubContext<Hub> _hubContext;
    private readonly ILogger<SignalRProgressBroadcaster> _logger;

    public SignalRProgressBroadcaster(
        IHubContext<Hub> hubContext,
        ILogger<SignalRProgressBroadcaster> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    // ========== MISSION EVENTS ==========

    public async Task BroadcastMissionProgressAsync(string userId, Mission mission)
    {
        try
        {
            _logger.LogInformation("Broadcasting mission progress update to user {UserId} for mission {MissionId}",
                userId, mission.Id);

            await _hubContext.Clients
                .Group($"user:{userId}")
                .SendAsync("MissionProgressUpdated", mission);

            _logger.LogDebug("Mission progress broadcasted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting mission progress to user {UserId}", userId);
        }
    }

    public async Task BroadcastMissionCompletedAsync(string userId, Mission mission)
    {
        try
        {
            _logger.LogInformation("Broadcasting mission completion to user {UserId} for mission {MissionId}",
                userId, mission.Id);

            await _hubContext.Clients
                .Group($"user:{userId}")
                .SendAsync("MissionCompleted", mission);

            _logger.LogDebug("Mission completion broadcasted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting mission completion to user {UserId}", userId);
        }
    }

    // ========== BADGE EVENTS ==========

    public async Task BroadcastBadgeEarnedAsync(string userId, Badge badge)
    {
        try
        {
            _logger.LogInformation("Broadcasting badge earned to user {UserId} for badge {BadgeId}",
                userId, badge.Id);

            await _hubContext.Clients
                .Group($"user:{userId}")
                .SendAsync("BadgeEarned", badge);

            _logger.LogDebug("Badge earned broadcasted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting badge earned to user {UserId}", userId);
        }
    }

    // ========== BONUS EVENTS ==========

    public async Task BroadcastBonusIssuedAsync(string userId, Bonus bonus, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Broadcasting bonus issued to user {UserId} for bonus {BonusId}",
                userId, bonus.Id);

            await _hubContext.Clients
                .Group($"user:{userId}")
                .SendAsync("BonusIssued", bonus, cancellationToken);

            _logger.LogDebug("Bonus issued broadcasted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting bonus issued to user {UserId}", userId);
        }
    }

    public async Task BroadcastBonusClaimedAsync(string userId, Bonus bonus, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Broadcasting bonus claimed to user {UserId} for bonus {BonusId}",
                userId, bonus.Id);

            await _hubContext.Clients
                .Group($"user:{userId}")
                .SendAsync("BonusClaimed", bonus, cancellationToken);

            _logger.LogDebug("Bonus claimed broadcasted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting bonus claimed to user {UserId}", userId);
        }
    }

    public async Task BroadcastBonusExpiredAsync(string userId, string bonusId, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Broadcasting bonus expired to user {UserId} for bonus {BonusId}",
                userId, bonusId);

            await _hubContext.Clients
                .Group($"user:{userId}")
                .SendAsync("BonusExpired", new { BonusId = bonusId }, cancellationToken);

            _logger.LogDebug("Bonus expired broadcasted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting bonus expired to user {UserId}", userId);
        }
    }

    // ========== MINI GAME EVENTS ==========

    public async Task BroadcastMiniGamePlayedAsync(string userId, MiniGame game, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Broadcasting mini game played to user {UserId} for game {GameId}",
                userId, game.Id);

            await _hubContext.Clients
                .Group($"user:{userId}")
                .SendAsync("MiniGamePlayed", game, cancellationToken);

            _logger.LogDebug("Mini game played broadcasted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting mini game played to user {UserId}", userId);
        }
    }

    public async Task BroadcastMiniGamePrizeWonAsync(string userId, MiniGame game, MiniGamePrize prize, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Broadcasting mini game prize won to user {UserId} for game {GameId}, prize {PrizeId}",
                userId, game.Id, prize.Id);

            await _hubContext.Clients
                .Group($"user:{userId}")
                .SendAsync("MiniGamePrizeWon", new { Game = game, Prize = prize }, cancellationToken);

            _logger.LogDebug("Mini game prize won broadcasted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting mini game prize won to user {UserId}", userId);
        }
    }

    public async Task BroadcastMiniGameJackpotWonAsync(string userId, MiniGame game, decimal jackpotAmount, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Broadcasting mini game jackpot won to ALL USERS - Winner: {UserId}, Game: {GameId}, Amount: {Amount}",
                userId, game.Id, jackpotAmount);

            // Broadcast to ALL connected clients (not just user group)
            await _hubContext.Clients.All
                .SendAsync("MiniGameJackpotWon", new
                {
                    UserId = userId,
                    Game = game,
                    JackpotAmount = jackpotAmount
                }, cancellationToken);

            _logger.LogDebug("Mini game jackpot won broadcasted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting mini game jackpot won");
        }
    }

    public async Task BroadcastMiniGamePoolUpdatedAsync(int gameId, int prizeId, int remainingPool, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Broadcasting mini game pool updated to ALL USERS - Game: {GameId}, Prize: {PrizeId}, Remaining: {Remaining}",
                gameId, prizeId, remainingPool);

            // Broadcast to ALL connected clients (not just user group)
            await _hubContext.Clients.All
                .SendAsync("MiniGamePoolUpdated", new
                {
                    GameId = gameId,
                    PrizeId = prizeId,
                    RemainingPool = remainingPool
                }, cancellationToken);

            _logger.LogDebug("Mini game pool updated broadcasted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting mini game pool updated for game {GameId}, prize {PrizeId}",
                gameId, prizeId);
        }
    }

    public async Task BroadcastMiniGameAvailableAsync(string userId, MiniGame game, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Broadcasting mini game available to user {UserId} for game {GameId}",
                userId, game.Id);

            await _hubContext.Clients
                .Group($"user:{userId}")
                .SendAsync("MiniGameAvailable", game, cancellationToken);

            _logger.LogDebug("Mini game available broadcasted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting mini game available to user {UserId}", userId);
        }
    }

    // ========== TOURNAMENT EVENTS ==========

    public async Task BroadcastTournamentRegisteredAsync(string userId, Tournament tournament, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Broadcasting tournament registered to user {UserId} for tournament {TournamentId}",
                userId, tournament.InstanceId);

            await _hubContext.Clients
                .Group($"user:{userId}")
                .SendAsync("TournamentRegistered", tournament, cancellationToken);

            _logger.LogDebug("Tournament registered broadcasted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting tournament registered to user {UserId}, tournament {TournamentId}",
                userId, tournament.InstanceId);
        }
    }

    public async Task BroadcastTournamentLeaderboardUpdatedAsync(int tournamentInstanceId, List<TournamentParticipant> participants, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Broadcasting tournament leaderboard updated to ALL USERS - Tournament: {TournamentId}, Participants: {Count}",
                tournamentInstanceId, participants.Count);

            // Broadcast to ALL connected clients viewing this tournament
            await _hubContext.Clients.All
                .SendAsync("TournamentLeaderboardUpdated", new
                {
                    TournamentInstanceId = tournamentInstanceId,
                    Participants = participants
                }, cancellationToken);

            _logger.LogDebug("Tournament leaderboard updated broadcasted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting tournament leaderboard updated for tournament {TournamentId}",
                tournamentInstanceId);
        }
    }

    public async Task BroadcastTournamentStatusChangedAsync(Tournament tournament, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Broadcasting tournament status changed to ALL USERS - Tournament: {TournamentId}, Status: {Status}",
                tournament.InstanceId, tournament.Status);

            // Broadcast to ALL connected clients
            await _hubContext.Clients.All
                .SendAsync("TournamentStatusChanged", tournament, cancellationToken);

            _logger.LogDebug("Tournament status changed broadcasted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting tournament status changed for tournament {TournamentId}",
                tournament.InstanceId);
        }
    }

    public async Task BroadcastTournamentPrizeWonAsync(string userId, Tournament tournament, TournamentPrize prize, int finalPosition, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Broadcasting tournament prize won to user {UserId} - Tournament: {TournamentId}, Prize: {PrizeName}, Position: {Position}",
                userId, tournament.InstanceId, prize.Name, finalPosition);

            await _hubContext.Clients
                .Group($"user:{userId}")
                .SendAsync("TournamentPrizeWon", new
                {
                    Tournament = tournament,
                    Prize = prize,
                    FinalPosition = finalPosition
                }, cancellationToken);

            _logger.LogDebug("Tournament prize won broadcasted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting tournament prize won to user {UserId}, tournament {TournamentId}",
                userId, tournament.InstanceId);
        }
    }

    // ========== LEVEL EVENTS ==========

    public async Task BroadcastLevelProgressUpdatedAsync(string userId, UserLevelProgress progress, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Broadcasting level progress update to user {UserId} - Level: {CurrentLevel}, Progress: {Progress}%",
                userId, progress.CurrentLevelName, progress.ProgressPercentage?.ToString("F2") ?? "N/A");

            await _hubContext.Clients
                .Group($"user:{userId}")
                .SendAsync("LevelProgressUpdated", progress, cancellationToken);

            _logger.LogDebug("Level progress update broadcasted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting level progress update to user {UserId}", userId);
        }
    }

    public async Task BroadcastLevelUpAchievedAsync(string userId, Level newLevel, Level? previousLevel, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Broadcasting level-up achievement to user {UserId} - New Level: {NewLevel} (from {PreviousLevel})",
                userId, newLevel.Name, previousLevel?.Name ?? "Level 0");

            await _hubContext.Clients
                .Group($"user:{userId}")
                .SendAsync("LevelUpAchieved", new
                {
                    NewLevel = newLevel,
                    PreviousLevel = previousLevel,
                    UserId = userId
                }, cancellationToken);

            _logger.LogDebug("Level-up achievement broadcasted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting level-up achievement to user {UserId}, new level {LevelId}",
                userId, newLevel.Id);
        }
    }
}

