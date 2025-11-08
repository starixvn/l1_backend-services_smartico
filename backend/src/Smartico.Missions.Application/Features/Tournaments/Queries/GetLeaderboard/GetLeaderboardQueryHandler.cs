using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.Tournaments.Queries.GetLeaderboard;

/// <summary>
/// Handler for GetLeaderboardQuery with 30-second caching.
/// </summary>
public class GetLeaderboardQueryHandler : IRequestHandler<GetLeaderboardQuery, GetLeaderboardResponse>
{
    private readonly ISmarticoTournamentApiClient _tournamentApiClient;
    private readonly ICacheService _cacheService;
    private readonly ILogger<GetLeaderboardQueryHandler> _logger;

    private const string CacheKeyPrefix = "tournament:leaderboard";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

    public GetLeaderboardQueryHandler(
        ISmarticoTournamentApiClient tournamentApiClient,
        ICacheService cacheService,
        ILogger<GetLeaderboardQueryHandler> logger)
    {
        _tournamentApiClient = tournamentApiClient;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<GetLeaderboardResponse> Handle(GetLeaderboardQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling GetLeaderboardQuery for user {UserId}, tournament {TournamentInstanceId}",
            request.UserId, request.TournamentInstanceId);

        // Try to get from cache
        var cacheKey = $"{CacheKeyPrefix}:{request.TournamentInstanceId}:{request.UserId}";
        var cachedLeaderboard = await _cacheService.GetAsync<List<TournamentParticipant>>(cacheKey);

        if (cachedLeaderboard != null)
        {
            _logger.LogInformation("Returning cached leaderboard for tournament {TournamentInstanceId} with {Count} participants",
                request.TournamentInstanceId, cachedLeaderboard.Count);
            return new GetLeaderboardResponse(cachedLeaderboard);
        }

        // Fetch from API client
        var participants = await _tournamentApiClient.GetLeaderboardAsync(
            request.UserId,
            request.TournamentInstanceId,
            cancellationToken);

        // Cache the result
        await _cacheService.SetAsync(cacheKey, participants, CacheTtl);

        _logger.LogInformation("Fetched and cached leaderboard for tournament {TournamentInstanceId} with {Count} participants",
            request.TournamentInstanceId, participants.Count);

        return new GetLeaderboardResponse(participants);
    }
}
