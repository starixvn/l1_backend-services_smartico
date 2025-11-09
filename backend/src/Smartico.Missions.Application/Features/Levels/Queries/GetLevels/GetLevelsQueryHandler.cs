using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.Levels.Queries.GetLevels;

/// <summary>
/// Handler for retrieving all levels visible to a user.
/// Implements caching (30s TTL) and visibility filtering based on user points.
/// </summary>
public class GetLevelsQueryHandler : IRequestHandler<GetLevelsQuery, GetLevelsResponse>
{
    private readonly ISmarticoLevelApiClient _levelApiClient;
    private readonly ICacheService _cacheService;
    private readonly ILogger<GetLevelsQueryHandler> _logger;

    public GetLevelsQueryHandler(
        ISmarticoLevelApiClient levelApiClient,
        ICacheService cacheService,
        ILogger<GetLevelsQueryHandler> logger)
    {
        _levelApiClient = levelApiClient;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<GetLevelsResponse> Handle(
        GetLevelsQuery request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling GetLevelsQuery for user {UserId}", request.UserId);

        var cacheKey = $"levels:{request.UserId}";

        // Try cache first
        var cachedResponse = await _cacheService.GetAsync<GetLevelsResponse>(cacheKey);
        if (cachedResponse != null)
        {
            _logger.LogInformation(
                "Returning cached levels for user {UserId} ({LevelCount} levels)",
                request.UserId,
                cachedResponse.Levels.Count
            );
            return cachedResponse;
        }

        // Fetch levels from API
        _logger.LogInformation("Fetching levels from API for user {UserId}", request.UserId);
        var levels = await _levelApiClient.GetLevelsAsync(request.UserId, cancellationToken);

        // Get user's current progress to determine current level ID
        var userProgress = await _levelApiClient.GetUserLevelProgressAsync(request.UserId, cancellationToken);
        var userCurrentLevelId = userProgress?.CurrentLevelId ?? levels.FirstOrDefault()?.Id ?? 0;

        // Sort by required points (ascending)
        var sortedLevels = levels.OrderBy(l => l.RequiredPoints).ToList();

        _logger.LogInformation(
            "Fetched {LevelCount} levels for user {UserId}, current level ID: {CurrentLevelId}",
            sortedLevels.Count,
            request.UserId,
            userCurrentLevelId
        );

        var response = new GetLevelsResponse(sortedLevels, userCurrentLevelId);

        // Cache the response
        await _cacheService.SetAsync(cacheKey, response, TimeSpan.FromSeconds(30));

        _logger.LogInformation(
            "Cached levels for user {UserId} with 30s TTL",
            request.UserId
        );

        return response;
    }
}
