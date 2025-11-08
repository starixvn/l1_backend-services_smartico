using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.Bonuses.Queries;

/// <summary>
/// Query to retrieve all bonuses for a user
/// </summary>
public record GetBonusesQuery(string UserId) : IRequest<GetBonusesResponse>;

/// <summary>
/// Response containing list of bonuses
/// </summary>
public record GetBonusesResponse(IEnumerable<Bonus> Bonuses);

/// <summary>
/// Handler for GetBonusesQuery
/// </summary>
public class GetBonusesQueryHandler : IRequestHandler<GetBonusesQuery, GetBonusesResponse>
{
    private readonly ISmarticoBonusApiClient _bonusApiClient;
    private readonly ICacheService _cacheService;
    private readonly ILogger<GetBonusesQueryHandler> _logger;
    private const string CacheKeyPrefix = "bonuses";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

    public GetBonusesQueryHandler(
        ISmarticoBonusApiClient bonusApiClient,
        ICacheService cacheService,
        ILogger<GetBonusesQueryHandler> logger)
    {
        _bonusApiClient = bonusApiClient;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<GetBonusesResponse> Handle(
        GetBonusesQuery request,
        CancellationToken cancellationToken)
    {
        var cacheKey = $"{CacheKeyPrefix}:{request.UserId}";

        // Try get from cache first
        var cachedBonuses = await _cacheService.GetAsync<List<Bonus>>(cacheKey);
        if (cachedBonuses != null)
        {
            _logger.LogInformation("Returning {Count} bonuses from cache for user {UserId}",
                cachedBonuses.Count, request.UserId);
            return new GetBonusesResponse(cachedBonuses);
        }

        // Fetch from API
        _logger.LogInformation("Fetching bonuses from API for user {UserId}", request.UserId);
        var bonuses = await _bonusApiClient.GetBonusesAsync(request.UserId, cancellationToken);
        var bonusList = bonuses.ToList();

        // Cache the result
        await _cacheService.SetAsync(cacheKey, bonusList, CacheTtl);

        _logger.LogInformation("Returning {Count} bonuses for user {UserId}",
            bonusList.Count, request.UserId);

        return new GetBonusesResponse(bonusList);
    }
}
