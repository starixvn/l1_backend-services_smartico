using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Application.Features.Velocity.DTOs;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.Velocity.Queries.GetLevelUpEvents;

/// <summary>
/// Handler for GetLevelUpEventsQuery with 30-second caching.
/// </summary>
public class GetLevelUpEventsQueryHandler : IRequestHandler<GetLevelUpEventsQuery, GetLevelUpEventsResponse>
{
    private readonly ICacheService _cacheService;
    private readonly ILogger<GetLevelUpEventsQueryHandler> _logger;

    private const string CacheKeyPrefix = "velocity:level-up-events";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

    public GetLevelUpEventsQueryHandler(
        ICacheService cacheService,
        ILogger<GetLevelUpEventsQueryHandler> logger)
    {
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<GetLevelUpEventsResponse> Handle(GetLevelUpEventsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling GetLevelUpEventsQuery for user {UserId}", request.UserId);

        var cacheKey = $"{CacheKeyPrefix}:{request.UserId}";

        // Try to get from cache first
        var cachedResponse = await _cacheService.GetAsync<GetLevelUpEventsResponse>(cacheKey);
        if (cachedResponse != null)
        {
            _logger.LogDebug("Returning level-up events from cache for user {UserId}", request.UserId);
            return cachedResponse;
        }

        // Generate demo level-up events (one unacknowledged for celebration demo)
        var events = GenerateDemoLevelUpEvents();

        var response = new GetLevelUpEventsResponse(events);

        // Cache the result
        await _cacheService.SetAsync(cacheKey, response, CacheTtl);

        _logger.LogInformation("Generated and cached {EventCount} level-up events for user {UserId}",
            events.Count, request.UserId);

        return response;
    }

    private static List<LevelUpEventDto> GenerateDemoLevelUpEvents()
    {
        // Demo: One unacknowledged level-up event for celebration display
        return new List<LevelUpEventDto>
        {
            new(
                Id: "levelup-001",
                PreviousTier: 1,
                PreviousTierName: "Ignition",
                NewTier: 2,
                NewTierName: "Cruiser",
                AchievedAt: DateTime.UtcNow.AddDays(-7),
                NewBenefits: new List<TierFeatureDto>
                {
                    new(TierFeatureType.Mission, "Daily Missions", "Access to 2 daily missions", 2),
                    new(TierFeatureType.Tournament, "Weekly Tournaments", "Enter weekly tournament competitions", null)
                },
                NewMissions: new List<string> { "Weekend Warrior" },
                Acknowledged: false
            )
        };
    }
}
