using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using Smartico.Missions.Application.Features.Jackpots.Mappers;
using Smartico.Missions.Domain.Interfaces;
using Smartico.Missions.Domain.Configuration;

namespace Smartico.Missions.Application.Features.Jackpots.Queries.GetJackpots;

/// <summary>
/// Handler for retrieving all active jackpots with user opt-in status.
/// Reads jackpot data from MongoDB (populated by backoffice-api).
/// Implements caching (30s TTL) for performance.
/// </summary>
public class GetJackpotsQueryHandler : IRequestHandler<GetJackpotsQuery, GetJackpotsResponse>
{
    private readonly IJackpotReadRepository _jackpotRepository;
    private readonly ICacheService _cacheService;
    private readonly DemoSettings _demoSettings;
    private readonly ILogger<GetJackpotsQueryHandler> _logger;

    public GetJackpotsQueryHandler(
        IJackpotReadRepository jackpotRepository,
        ICacheService cacheService,
        IOptions<DemoSettings> demoSettings,
        ILogger<GetJackpotsQueryHandler> logger)
    {
        _jackpotRepository = jackpotRepository;
        _cacheService = cacheService;
        _demoSettings = demoSettings.Value;
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

        // Resolve operator ID from configuration (demo mode)
        var operatorId = ObjectId.Parse(_demoSettings.DefaultOperatorId);

        // Fetch jackpots from MongoDB (populated by backoffice-api)
        _logger.LogInformation(
            "Fetching jackpots from MongoDB for operator {OperatorId}, user {UserId}",
            operatorId,
            request.UserId);

        var jackpotEntities = await _jackpotRepository.GetActiveJackpotsAsync(
            operatorId,
            cancellationToken);

        // Map BackOffice entities to API DTOs
        // Note: opt-in status and registration count will be populated from PlayerProgress in Phase 6
        var jackpots = jackpotEntities
            .Select(j => JackpotMapper.ToDto(
                jackpot: j,
                isOptedIn: false, // TODO: Get from PlayerProgress in Phase 6
                registrationCount: 0 // TODO: Calculate from PlayerProgress in Phase 6
            ))
            .ToList();

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
