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
}

