using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Application.Features.Velocity.DTOs;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.Velocity.Queries.GetVelocityProgress;

/// <summary>
/// Handler for GetVelocityProgressQuery with 30-second caching.
/// </summary>
public class GetVelocityProgressQueryHandler : IRequestHandler<GetVelocityProgressQuery, GetVelocityProgressResponse>
{
    private readonly ICacheService _cacheService;
    private readonly ILogger<GetVelocityProgressQueryHandler> _logger;

    private const string CacheKeyPrefix = "velocity:progress";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

    public GetVelocityProgressQueryHandler(
        ICacheService cacheService,
        ILogger<GetVelocityProgressQueryHandler> logger)
    {
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<GetVelocityProgressResponse> Handle(GetVelocityProgressQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling GetVelocityProgressQuery for user {UserId}", request.UserId);

        var cacheKey = $"{CacheKeyPrefix}:{request.UserId}";

        // Try to get from cache first
        var cachedProgress = await _cacheService.GetAsync<PlayerVelocityProgressDto>(cacheKey);
        if (cachedProgress != null)
        {
            _logger.LogDebug("Returning velocity progress from cache for user {UserId}", request.UserId);
            return new GetVelocityProgressResponse(cachedProgress);
        }

        // Generate demo data for the demo-user
        var progress = GenerateDemoProgress(request.UserId);

        // Cache the result
        await _cacheService.SetAsync(cacheKey, progress, CacheTtl);

        _logger.LogInformation("Generated and cached velocity progress for user {UserId} - Tier: {Tier}, XP: {Xp}",
            request.UserId, progress.CurrentTierName, progress.TotalXp);

        return new GetVelocityProgressResponse(progress);
    }

    private static PlayerVelocityProgressDto GenerateDemoProgress(string userId)
    {
        // Demo data: User at Tier 2 (Cruiser) with 2,450 XP
        return new PlayerVelocityProgressDto(
            UserId: userId,
            CurrentTier: 2,
            CurrentTierName: "Cruiser",
            TotalXp: 2450,
            CurrentTierXpThreshold: 1000,
            NextTierXpThreshold: 5000,
            XpToNextTier: 2550,
            ProgressPercentage: 36.25, // (2450 - 1000) / (5000 - 1000) * 100
            IsMaxTier: false,
            TierAchievedAt: DateTime.UtcNow.AddDays(-7),
            XpBreakdown: new XpBreakdownDto(
                Slots: 1500,
                TableGames: 450,
                Missions: 350,
                Other: 150
            )
        );
    }
}
