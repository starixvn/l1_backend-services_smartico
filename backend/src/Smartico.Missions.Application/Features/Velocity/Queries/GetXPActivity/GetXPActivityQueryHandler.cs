using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Application.Features.Velocity.DTOs;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.Velocity.Queries.GetXPActivity;

/// <summary>
/// Handler for GetXPActivityQuery with 30-second caching.
/// </summary>
public class GetXPActivityQueryHandler : IRequestHandler<GetXPActivityQuery, GetXPActivityResponse>
{
    private readonly ICacheService _cacheService;
    private readonly ILogger<GetXPActivityQueryHandler> _logger;

    private const string CacheKeyPrefix = "velocity:xp-activity";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

    public GetXPActivityQueryHandler(
        ICacheService cacheService,
        ILogger<GetXPActivityQueryHandler> logger)
    {
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<GetXPActivityResponse> Handle(GetXPActivityQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling GetXPActivityQuery for user {UserId}, limit {Limit}, type {Type}",
            request.UserId, request.Limit, request.Type?.ToString() ?? "all");

        var cacheKey = $"{CacheKeyPrefix}:{request.UserId}:{request.Limit}:{request.Type?.ToString() ?? "all"}";

        // Try to get from cache first
        var cachedResponse = await _cacheService.GetAsync<GetXPActivityResponse>(cacheKey);
        if (cachedResponse != null)
        {
            _logger.LogDebug("Returning XP activity from cache for user {UserId}", request.UserId);
            return cachedResponse;
        }

        // Generate demo activities
        var allActivities = GenerateDemoActivities();

        // Filter by type if specified
        var filteredActivities = request.Type.HasValue
            ? allActivities.Where(a => a.Type == request.Type.Value).ToList()
            : allActivities;

        // Apply limit
        var limitedActivities = filteredActivities.Take(request.Limit).ToList();

        var response = new GetXPActivityResponse(limitedActivities, filteredActivities.Count);

        // Cache the result
        await _cacheService.SetAsync(cacheKey, response, CacheTtl);

        _logger.LogInformation("Generated and cached {ActivityCount} XP activities for user {UserId}",
            limitedActivities.Count, request.UserId);

        return response;
    }

    private static List<XpActivityDto> GenerateDemoActivities()
    {
        var now = DateTime.UtcNow;

        return new List<XpActivityDto>
        {
            new(
                Id: "act-001",
                Type: XpActivityType.SlotPlay,
                Description: "Played Starburst - 50 spins",
                XpEarned: 25,
                Timestamp: now.AddMinutes(-15),
                Reference: new ActivityReferenceDto("game", "starburst", "Starburst")
            ),
            new(
                Id: "act-002",
                Type: XpActivityType.MissionComplete,
                Description: "Completed Daily Driver mission",
                XpEarned: 50,
                Timestamp: now.AddHours(-2),
                Reference: new ActivityReferenceDto("mission", "mission-daily-driver", "The Daily Driver")
            ),
            new(
                Id: "act-003",
                Type: XpActivityType.TablePlay,
                Description: "Blackjack session - 15 hands",
                XpEarned: 30,
                Timestamp: now.AddHours(-5),
                Reference: new ActivityReferenceDto("game", "blackjack-classic", "Classic Blackjack")
            ),
            new(
                Id: "act-004",
                Type: XpActivityType.Bonus,
                Description: "Welcome bonus claimed",
                XpEarned: 100,
                Timestamp: now.AddDays(-1),
                Reference: null
            ),
            new(
                Id: "act-005",
                Type: XpActivityType.SlotPlay,
                Description: "Played Gonzo's Quest - 100 spins",
                XpEarned: 50,
                Timestamp: now.AddDays(-1).AddHours(-3),
                Reference: new ActivityReferenceDto("game", "gonzos-quest", "Gonzo's Quest")
            ),
            new(
                Id: "act-006",
                Type: XpActivityType.Promotion,
                Description: "Weekend Double XP promotion",
                XpEarned: 75,
                Timestamp: now.AddDays(-2),
                Reference: null
            ),
            new(
                Id: "act-007",
                Type: XpActivityType.TablePlay,
                Description: "Roulette session - 20 spins",
                XpEarned: 40,
                Timestamp: now.AddDays(-3),
                Reference: new ActivityReferenceDto("game", "european-roulette", "European Roulette")
            ),
            new(
                Id: "act-008",
                Type: XpActivityType.MissionComplete,
                Description: "Completed Weekly Challenge",
                XpEarned: 150,
                Timestamp: now.AddDays(-4),
                Reference: new ActivityReferenceDto("mission", "mission-weekly", "Weekly Challenge")
            ),
            new(
                Id: "act-009",
                Type: XpActivityType.SlotPlay,
                Description: "Played Book of Dead - 200 spins",
                XpEarned: 100,
                Timestamp: now.AddDays(-5),
                Reference: new ActivityReferenceDto("game", "book-of-dead", "Book of Dead")
            ),
            new(
                Id: "act-010",
                Type: XpActivityType.Bonus,
                Description: "Deposit bonus (100% match)",
                XpEarned: 200,
                Timestamp: now.AddDays(-6),
                Reference: null
            )
        };
    }
}
