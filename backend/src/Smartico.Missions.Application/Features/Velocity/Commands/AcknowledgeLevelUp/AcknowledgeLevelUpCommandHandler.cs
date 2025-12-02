using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.Velocity.Commands.AcknowledgeLevelUp;

/// <summary>
/// Wrapper class for caching boolean values.
/// </summary>
internal record AcknowledgmentStatus(bool IsAcknowledged);

/// <summary>
/// Handler for AcknowledgeLevelUpCommand.
/// </summary>
public class AcknowledgeLevelUpCommandHandler : IRequestHandler<AcknowledgeLevelUpCommand, AcknowledgeLevelUpResponse>
{
    private readonly ICacheService _cacheService;
    private readonly ILogger<AcknowledgeLevelUpCommandHandler> _logger;

    private const string CacheKeyPrefix = "velocity:acknowledged";

    public AcknowledgeLevelUpCommandHandler(
        ICacheService cacheService,
        ILogger<AcknowledgeLevelUpCommandHandler> logger)
    {
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<AcknowledgeLevelUpResponse> Handle(AcknowledgeLevelUpCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling AcknowledgeLevelUpCommand for user {UserId}, event {EventId}",
            request.UserId, request.EventId);

        // In a real implementation, this would update the database
        // For demo purposes, we store acknowledgment in cache
        var acknowledgedKey = $"{CacheKeyPrefix}:{request.UserId}:{request.EventId}";

        // Check if already acknowledged
        var acknowledgmentStatus = await _cacheService.GetAsync<AcknowledgmentStatus>(acknowledgedKey);
        if (acknowledgmentStatus?.IsAcknowledged == true)
        {
            _logger.LogWarning("Level-up event {EventId} already acknowledged for user {UserId}",
                request.EventId, request.UserId);
            return new AcknowledgeLevelUpResponse(true); // Idempotent - still success
        }

        // Mark as acknowledged (store for 24 hours)
        await _cacheService.SetAsync(acknowledgedKey, new AcknowledgmentStatus(true), TimeSpan.FromHours(24));

        // Invalidate the level-up events cache so next fetch shows acknowledged
        var eventsKey = $"velocity:level-up-events:{request.UserId}";
        await _cacheService.RemoveAsync(eventsKey);

        _logger.LogInformation("Level-up event {EventId} acknowledged for user {UserId}",
            request.EventId, request.UserId);

        return new AcknowledgeLevelUpResponse(true);
    }
}
