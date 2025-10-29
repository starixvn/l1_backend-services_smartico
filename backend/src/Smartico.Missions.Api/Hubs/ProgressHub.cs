using Microsoft.AspNetCore.SignalR;

namespace Smartico.Missions.Api.Hubs;

/// <summary>
/// SignalR hub for real-time mission progress updates.
/// Clients connect to this hub to receive live updates about mission progress.
/// </summary>
public class ProgressHub : Hub
{
    private readonly ILogger<ProgressHub> _logger;

    public ProgressHub(ILogger<ProgressHub> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Called when a client connects to the hub.
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var connectionId = Context.ConnectionId;
        
        // TODO: Extract user ID from JWT in TASK-010
        // For now, accept userId from query string
        var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();

        if (!string.IsNullOrEmpty(userId))
        {
            // Add connection to user-specific group
            await Groups.AddToGroupAsync(connectionId, $"user:{userId}");
            _logger.LogInformation("User {UserId} connected to ProgressHub (Connection: {ConnectionId})",
                userId, connectionId);
        }
        else
        {
            _logger.LogWarning("Client connected without userId (Connection: {ConnectionId})", connectionId);
        }

        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Called when a client disconnects from the hub.
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var connectionId = Context.ConnectionId;
        var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();

        if (!string.IsNullOrEmpty(userId))
        {
            _logger.LogInformation("User {UserId} disconnected from ProgressHub (Connection: {ConnectionId})",
                userId, connectionId);
        }

        if (exception != null)
        {
            _logger.LogError(exception, "Client disconnected with error (Connection: {ConnectionId})",
                connectionId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Client subscribes to mission updates.
    /// </summary>
    public async Task SubscribeToMissionUpdates()
    {
        var connectionId = Context.ConnectionId;
        _logger.LogInformation("Client subscribed to mission updates (Connection: {ConnectionId})",
            connectionId);
        
        await Task.CompletedTask;
    }

    /// <summary>
    /// Client unsubscribes from mission updates.
    /// </summary>
    public async Task UnsubscribeFromMissionUpdates()
    {
        var connectionId = Context.ConnectionId;
        _logger.LogInformation("Client unsubscribed from mission updates (Connection: {ConnectionId})",
            connectionId);
        
        await Task.CompletedTask;
    }
}

