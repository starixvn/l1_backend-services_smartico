using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Application.Features.Velocity.DTOs;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.Velocity.Queries.GetVelocityTiers;

/// <summary>
/// Handler for GetVelocityTiersQuery with 30-second caching.
/// </summary>
public class GetVelocityTiersQueryHandler : IRequestHandler<GetVelocityTiersQuery, GetVelocityTiersResponse>
{
    private readonly ICacheService _cacheService;
    private readonly ILogger<GetVelocityTiersQueryHandler> _logger;

    private const string CacheKey = "velocity:tiers";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

    public GetVelocityTiersQueryHandler(
        ICacheService cacheService,
        ILogger<GetVelocityTiersQueryHandler> logger)
    {
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<GetVelocityTiersResponse> Handle(GetVelocityTiersQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling GetVelocityTiersQuery");

        // Try to get from cache first
        var cachedTiers = await _cacheService.GetAsync<List<VelocityTierDto>>(CacheKey);
        if (cachedTiers != null)
        {
            _logger.LogDebug("Returning velocity tiers from cache");
            return new GetVelocityTiersResponse(cachedTiers);
        }

        // Generate static tier definitions
        var tiers = GenerateTierDefinitions();

        // Cache the result
        await _cacheService.SetAsync(CacheKey, tiers, CacheTtl);

        _logger.LogInformation("Generated and cached {TierCount} velocity tiers", tiers.Count);

        return new GetVelocityTiersResponse(tiers);
    }

    private static List<VelocityTierDto> GenerateTierDefinitions()
    {
        return new List<VelocityTierDto>
        {
            new(
                TierNumber: 1,
                Name: "Ignition",
                XpRequired: 0,
                Benefit: "Start your journey with daily missions",
                Rarity: TierRarity.Common,
                IconUrl: "/assets/tiers/ignition.svg",
                ThemeColor: "#6B7280",
                DailyMissionCount: 1,
                UnlockedMissions: new List<string> { "The Daily Driver" },
                UnlockedFeatures: new List<TierFeatureDto>
                {
                    new(TierFeatureType.Mission, "Daily Missions", "Access to 1 daily mission", 1)
                }
            ),
            new(
                TierNumber: 2,
                Name: "Cruiser",
                XpRequired: 1000,
                Benefit: "Unlock tournaments and bonus missions",
                Rarity: TierRarity.Rare,
                IconUrl: "/assets/tiers/cruiser.svg",
                ThemeColor: "#3B82F6",
                DailyMissionCount: 2,
                UnlockedMissions: new List<string> { "The Daily Driver", "Weekend Warrior" },
                UnlockedFeatures: new List<TierFeatureDto>
                {
                    new(TierFeatureType.Mission, "Daily Missions", "Access to 2 daily missions", 2),
                    new(TierFeatureType.Tournament, "Weekly Tournaments", "Enter weekly tournament competitions", null)
                }
            ),
            new(
                TierNumber: 3,
                Name: "Turbo",
                XpRequired: 5000,
                Benefit: "Access jackpot games and XP multipliers",
                Rarity: TierRarity.Epic,
                IconUrl: "/assets/tiers/turbo.svg",
                ThemeColor: "#8B5CF6",
                DailyMissionCount: 3,
                UnlockedMissions: new List<string> { "The Daily Driver", "Weekend Warrior", "High Roller Challenge" },
                UnlockedFeatures: new List<TierFeatureDto>
                {
                    new(TierFeatureType.Mission, "Daily Missions", "Access to 3 daily missions", 3),
                    new(TierFeatureType.Tournament, "Weekly Tournaments", "Enter weekly tournament competitions", null),
                    new(TierFeatureType.Jackpot, "Jackpot Access", "Play exclusive jackpot games", null),
                    new(TierFeatureType.Multiplier, "XP Boost", "1.5x XP multiplier on all activities", 1.5)
                }
            ),
            new(
                TierNumber: 4,
                Name: "Supersonic",
                XpRequired: 15000,
                Benefit: "Maximum rewards and exclusive VIP perks",
                Rarity: TierRarity.Legendary,
                IconUrl: "/assets/tiers/supersonic.svg",
                ThemeColor: "#F59E0B",
                DailyMissionCount: 4,
                UnlockedMissions: new List<string> { "The Daily Driver", "Weekend Warrior", "High Roller Challenge", "Supersonic Sprint" },
                UnlockedFeatures: new List<TierFeatureDto>
                {
                    new(TierFeatureType.Mission, "Daily Missions", "Access to 4 daily missions", 4),
                    new(TierFeatureType.Tournament, "VIP Tournaments", "Exclusive VIP tournament access", null),
                    new(TierFeatureType.Jackpot, "Premium Jackpots", "Access to premium jackpot games", null),
                    new(TierFeatureType.Multiplier, "XP Boost", "2x XP multiplier on all activities", 2.0)
                }
            )
        };
    }
}
