using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.Tournaments.Queries.GetTournaments;

/// <summary>
/// Handler for GetTournamentsQuery with 30-second caching.
/// </summary>
public class GetTournamentsQueryHandler : IRequestHandler<GetTournamentsQuery, GetTournamentsResponse>
{
    private readonly ISmarticoTournamentApiClient _tournamentApiClient;
    private readonly ICacheService _cacheService;
    private readonly ILogger<GetTournamentsQueryHandler> _logger;

    private const string CacheKeyPrefix = "tournaments";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

    public GetTournamentsQueryHandler(
        ISmarticoTournamentApiClient tournamentApiClient,
        ICacheService cacheService,
        ILogger<GetTournamentsQueryHandler> logger)
    {
        _tournamentApiClient = tournamentApiClient;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<GetTournamentsResponse> Handle(GetTournamentsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling GetTournamentsQuery for user {UserId}", request.UserId);

        var cacheKey = $"{CacheKeyPrefix}:{request.UserId}";

        // Try to get from cache first
        var cachedTournaments = await _cacheService.GetAsync<List<Tournament>>(cacheKey);
        if (cachedTournaments != null)
        {
            _logger.LogDebug("Returning {Count} tournaments from cache for user {UserId}",
                cachedTournaments.Count, request.UserId);
            return new GetTournamentsResponse(cachedTournaments);
        }

        // Fetch from API if not in cache
        var tournaments = await _tournamentApiClient.GetTournamentsAsync(request.UserId, cancellationToken);

        // Cache the result
        await _cacheService.SetAsync(cacheKey, tournaments, CacheTtl);

        _logger.LogInformation("Fetched and cached {Count} tournaments for user {UserId}",
            tournaments.Count, request.UserId);

        return new GetTournamentsResponse(tournaments);
    }
}
