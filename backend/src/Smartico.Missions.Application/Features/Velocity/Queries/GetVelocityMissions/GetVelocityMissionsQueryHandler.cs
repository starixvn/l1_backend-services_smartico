using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Application.Features.Velocity.DTOs;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.Velocity.Queries.GetVelocityMissions;

/// <summary>
/// Handler for GetVelocityMissionsQuery with 30-second caching.
/// </summary>
public class GetVelocityMissionsQueryHandler : IRequestHandler<GetVelocityMissionsQuery, GetVelocityMissionsResponse>
{
    private readonly ICacheService _cacheService;
    private readonly ILogger<GetVelocityMissionsQueryHandler> _logger;

    private const string CacheKeyPrefix = "velocity:missions";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

    public GetVelocityMissionsQueryHandler(
        ICacheService cacheService,
        ILogger<GetVelocityMissionsQueryHandler> logger)
    {
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<GetVelocityMissionsResponse> Handle(GetVelocityMissionsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling GetVelocityMissionsQuery for user {UserId}", request.UserId);

        var cacheKey = $"{CacheKeyPrefix}:{request.UserId}";

        // Try to get from cache first
        var cachedResponse = await _cacheService.GetAsync<GetVelocityMissionsResponse>(cacheKey);
        if (cachedResponse != null)
        {
            _logger.LogDebug("Returning velocity missions from cache for user {UserId}", request.UserId);
            return cachedResponse;
        }

        // Demo: User is at Tier 2
        const int playerTier = 2;
        var missions = GenerateDemoMissions(playerTier);

        var response = new GetVelocityMissionsResponse(missions, playerTier);

        // Cache the result
        await _cacheService.SetAsync(cacheKey, response, CacheTtl);

        _logger.LogInformation("Generated and cached {MissionCount} missions for user {UserId}", missions.Count, request.UserId);

        return response;
    }

    private static List<TierMissionDto> GenerateDemoMissions(int playerTier)
    {
        return new List<TierMissionDto>
        {
            new(
                Id: "mission-daily-driver",
                Name: "The Daily Driver",
                Description: "Complete 10 slot spins to earn your daily bonus",
                RequiredTier: 1,
                IsAvailable: playerTier >= 1,
                IsCompleted: true,
                XpReward: 50,
                Rewards: new List<MissionRewardDto>
                {
                    new(MissionRewardType.FreeSpins, 10, "10 Free Spins on Starburst"),
                    new(MissionRewardType.XpBoost, 50, "+50 XP")
                }
            ),
            new(
                Id: "mission-weekend-warrior",
                Name: "Weekend Warrior",
                Description: "Play any 5 different games over the weekend",
                RequiredTier: 2,
                IsAvailable: playerTier >= 2,
                IsCompleted: false,
                XpReward: 100,
                Rewards: new List<MissionRewardDto>
                {
                    new(MissionRewardType.Cash, 5, "$5 Bonus Cash"),
                    new(MissionRewardType.XpBoost, 100, "+100 XP")
                }
            ),
            new(
                Id: "mission-high-roller",
                Name: "High Roller Challenge",
                Description: "Place 20 bets of $10 or more on table games",
                RequiredTier: 3,
                IsAvailable: playerTier >= 3,
                IsCompleted: false,
                XpReward: 200,
                Rewards: new List<MissionRewardDto>
                {
                    new(MissionRewardType.Cash, 25, "$25 Bonus Cash"),
                    new(MissionRewardType.Badge, 1, "High Roller Badge"),
                    new(MissionRewardType.XpBoost, 200, "+200 XP")
                }
            ),
            new(
                Id: "mission-supersonic-sprint",
                Name: "Supersonic Sprint",
                Description: "Win 10 consecutive hands in Blackjack",
                RequiredTier: 4,
                IsAvailable: playerTier >= 4,
                IsCompleted: false,
                XpReward: 500,
                Rewards: new List<MissionRewardDto>
                {
                    new(MissionRewardType.Cash, 100, "$100 Bonus Cash"),
                    new(MissionRewardType.FreeSpins, 50, "50 Free Spins on Mega Fortune"),
                    new(MissionRewardType.Badge, 1, "Supersonic Champion Badge"),
                    new(MissionRewardType.XpBoost, 500, "+500 XP")
                }
            )
        };
    }
}
