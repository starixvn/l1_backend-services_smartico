using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.Levels.Queries.GetUserLevelProgress;

/// <summary>
/// Handler for GetUserLevelProgressQuery with 30-second caching.
/// </summary>
public class GetUserLevelProgressQueryHandler : IRequestHandler<GetUserLevelProgressQuery, GetUserLevelProgressResponse>
{
    private readonly ISmarticoLevelApiClient _levelApiClient;
    private readonly ICacheService _cacheService;
    private readonly ILogger<GetUserLevelProgressQueryHandler> _logger;

    private const string CacheKeyPrefix = "level:progress";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

    public GetUserLevelProgressQueryHandler(
        ISmarticoLevelApiClient levelApiClient,
        ICacheService cacheService,
        ILogger<GetUserLevelProgressQueryHandler> logger)
    {
        _levelApiClient = levelApiClient;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<GetUserLevelProgressResponse> Handle(GetUserLevelProgressQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling GetUserLevelProgressQuery for user {UserId}", request.UserId);

        var cacheKey = $"{CacheKeyPrefix}:{request.UserId}";

        // Try to get from cache first
        var cachedProgress = await _cacheService.GetAsync<UserLevelProgress>(cacheKey);
        if (cachedProgress != null)
        {
            _logger.LogDebug("Returning level progress from cache for user {UserId} - Level: {Level}, Progress: {Progress}%",
                request.UserId, cachedProgress.CurrentLevelName, cachedProgress.ProgressPercentage?.ToString("F2") ?? "N/A");
            return new GetUserLevelProgressResponse(cachedProgress);
        }

        // Fetch from API if not in cache
        var progress = await _levelApiClient.GetUserLevelProgressAsync(request.UserId, cancellationToken);

        // If user has no level data (0 points, new user), return null
        if (progress == null)
        {
            _logger.LogWarning("User {UserId} has no level data (0 points or new user)", request.UserId);
            return new GetUserLevelProgressResponse(null);
        }

        // Cache the result
        await _cacheService.SetAsync(cacheKey, progress, CacheTtl);

        _logger.LogInformation("Fetched and cached level progress for user {UserId} - Level: {Level}, Progress: {Progress}%",
            request.UserId, progress.CurrentLevelName, progress.ProgressPercentage?.ToString("F2") ?? "N/A");

        return new GetUserLevelProgressResponse(progress);
    }
}
