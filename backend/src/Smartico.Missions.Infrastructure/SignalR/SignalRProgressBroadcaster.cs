using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Infrastructure.SignalR;

/// <summary>
/// SignalR-based implementation of IProgressBroadcaster.
/// Broadcasts real-time updates to connected clients.
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

    public async Task BroadcastMissionProgressAsync(string userId, Mission mission)
    {
        try
        {
            _logger.LogInformation("Broadcasting mission progress update to user {UserId} for mission {MissionId}",
                userId, mission.Id);

            // Send to user-specific group
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

            // Send to user-specific group
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

    public async Task BroadcastBadgeEarnedAsync(string userId, Badge badge)
    {
        try
        {
            _logger.LogInformation("Broadcasting badge earned to user {UserId} for badge {BadgeId}",
                userId, badge.Id);

            // Send to user-specific group
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
}

