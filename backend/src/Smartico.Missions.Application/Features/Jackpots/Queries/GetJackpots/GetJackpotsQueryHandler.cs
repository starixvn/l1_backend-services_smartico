using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.Jackpots.Queries.GetJackpots;

/// <summary>
/// Handler for retrieving all active jackpots with user opt-in status.
/// Implements caching (30s TTL) for performance.
/// </summary>
public class GetJackpotsQueryHandler : IRequestHandler<GetJackpotsQuery, GetJackpotsResponse>
{
    private readonly ISmarticoJackpotApiClient _jackpotApiClient;
    private readonly ICacheService _cacheService;
    private readonly ILogger<GetJackpotsQueryHandler> _logger;

    public GetJackpotsQueryHandler(
        ISmarticoJackpotApiClient jackpotApiClient,
        ICacheService cacheService,
        ILogger<GetJackpotsQueryHandler> logger)
    {
        _jackpotApiClient = jackpotApiClient;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<GetJackpotsResponse> Handle(
        GetJackpotsQuery request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling GetJackpotsQuery for user {UserId}", request.UserId);

        var cacheKey = $"jackpots:{request.UserId}";

        // Try cache first
        var cachedResponse = await _cacheService.GetAsync<GetJackpotsResponse>(cacheKey);
        if (cachedResponse != null)
        {
            _logger.LogInformation(
                "Returning cached jackpots for user {UserId} ({JackpotCount} jackpots)",
                request.UserId,
                cachedResponse.Jackpots.Count
            );
            return cachedResponse;
        }

        // Fetch jackpots from API
        _logger.LogInformation("Fetching jackpots from API for user {UserId}", request.UserId);
        var jackpots = await _jackpotApiClient.GetJackpotsAsync(request.UserId, cancellationToken);

        _logger.LogInformation(
            "Fetched {JackpotCount} jackpots for user {UserId}",
            jackpots.Count,
            request.UserId
        );

        var response = new GetJackpotsResponse(jackpots);

        // Cache the response
        await _cacheService.SetAsync(cacheKey, response, TimeSpan.FromSeconds(30));

        _logger.LogInformation(
            "Cached jackpots for user {UserId} with 30s TTL",
            request.UserId
        );

        return response;
    }
}
