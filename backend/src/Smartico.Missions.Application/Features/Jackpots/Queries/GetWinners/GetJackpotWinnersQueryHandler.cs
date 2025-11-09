using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.Jackpots.Queries.GetWinners;

/// <summary>
/// Handler for GetJackpotWinnersQuery
/// Implements 30-second caching for winner data to reduce API load
/// </summary>
public class GetJackpotWinnersQueryHandler : IRequestHandler<GetJackpotWinnersQuery, GetJackpotWinnersResponse>
{
    private readonly ISmarticoJackpotApiClient _jackpotApiClient;
    private readonly ICacheService _cacheService;
    private readonly ILogger<GetJackpotWinnersQueryHandler> _logger;

    private const int CACHE_DURATION_SECONDS = 30;

    public GetJackpotWinnersQueryHandler(
        ISmarticoJackpotApiClient jackpotApiClient,
        ICacheService cacheService,
        ILogger<GetJackpotWinnersQueryHandler> logger)
    {
        _jackpotApiClient = jackpotApiClient;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<GetJackpotWinnersResponse> Handle(GetJackpotWinnersQuery request, CancellationToken cancellationToken)
    {
        var filterTypeString = request.FilterType.HasValue ? request.FilterType.Value.ToString() : "all";
        var cacheKey = $"jackpot-winners:{request.UserId}:{filterTypeString}";

        _logger.LogDebug("Fetching jackpot winners for user {UserId} with filter {FilterType}",
            request.UserId, filterTypeString);

        // Try to get from cache
        var cachedResponse = await _cacheService.GetAsync<GetJackpotWinnersResponse>(cacheKey);
        if (cachedResponse != null)
        {
            _logger.LogDebug("Returning cached jackpot winners for user {UserId}", request.UserId);
            return cachedResponse;
        }

        // Fetch from API
        var winners = await _jackpotApiClient.GetWinnersAsync(
            request.UserId,
            request.FilterType,
            cancellationToken);

        var response = new GetJackpotWinnersResponse(winners);

        // Cache for 30 seconds
        await _cacheService.SetAsync(cacheKey, response, TimeSpan.FromSeconds(CACHE_DURATION_SECONDS));

        _logger.LogInformation("Retrieved {Count} jackpot winners for user {UserId}",
            winners.Count, request.UserId);

        return response;
    }
}
