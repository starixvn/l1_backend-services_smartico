using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.MiniGames.Queries;

/// <summary>
/// Query to retrieve all available mini games for a user
/// </summary>
public record GetMiniGamesQuery(string UserId) : IRequest<GetMiniGamesResponse>;

/// <summary>
/// Response containing list of mini games
/// </summary>
public record GetMiniGamesResponse(IEnumerable<MiniGame> MiniGames);

/// <summary>
/// Handler for GetMiniGamesQuery
/// </summary>
public class GetMiniGamesQueryHandler : IRequestHandler<GetMiniGamesQuery, GetMiniGamesResponse>
{
    private readonly ISmarticoMiniGameApiClient _miniGameApiClient;
    private readonly ICacheService _cacheService;
    private readonly ILogger<GetMiniGamesQueryHandler> _logger;
    private const string CacheKeyPrefix = "minigames";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

    public GetMiniGamesQueryHandler(
        ISmarticoMiniGameApiClient miniGameApiClient,
        ICacheService cacheService,
        ILogger<GetMiniGamesQueryHandler> logger)
    {
        _miniGameApiClient = miniGameApiClient;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<GetMiniGamesResponse> Handle(
        GetMiniGamesQuery request,
        CancellationToken cancellationToken)
    {
        var cacheKey = $"{CacheKeyPrefix}:{request.UserId}";

        // Try get from cache first
        var cachedGames = await _cacheService.GetAsync<List<MiniGame>>(cacheKey);
        if (cachedGames != null)
        {
            _logger.LogInformation("Returning {Count} mini games from cache for user {UserId}",
                cachedGames.Count, request.UserId);
            return new GetMiniGamesResponse(cachedGames);
        }

        // Fetch from API
        _logger.LogInformation("Fetching mini games from API for user {UserId}", request.UserId);
        var miniGames = await _miniGameApiClient.GetMiniGamesAsync(request.UserId, cancellationToken);
        var miniGamesList = miniGames.ToList();

        // Cache the result
        await _cacheService.SetAsync(cacheKey, miniGamesList, CacheTtl);

        _logger.LogInformation("Returning {Count} mini games for user {UserId}",
            miniGamesList.Count, request.UserId);

        return new GetMiniGamesResponse(miniGamesList);
    }
}
