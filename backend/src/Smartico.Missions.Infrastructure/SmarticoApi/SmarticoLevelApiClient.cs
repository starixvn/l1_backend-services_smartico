using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Infrastructure.SmarticoApi;

/// <summary>
/// Level API client with in-memory demo data.
/// Provides 7 progressive levels from Bronze to Legend with realistic point requirements.
/// </summary>
public class SmarticoLevelApiClient : ISmarticoLevelApiClient
{
    private readonly ILogger<SmarticoLevelApiClient> _logger;
    private readonly object _lock = new();

    // Demo data: User points tracking (simulates ach_points_ever from user properties)
    private readonly Dictionary<string, int> _userPoints = new()
    {
        { "user123", 1250 },    // Currently at Silver level (1000 pts), 25% to Gold
        { "demo_user", 3500 },  // Currently at Gold level (3000 pts), 17% to Platinum
        { "newbie", 50 },       // Currently at Bronze level (0 pts), 10% to Silver
        { "elite", 15000 }      // Currently at Diamond level (10000 pts), 50% to Legend
    };

    // Demo data: Advanced leveling counters (optional)
    private readonly Dictionary<string, (int counter1, int counter2)> _userCounters = new()
    {
        { "user123", (5, 2) },    // 5 missions completed, 2 tournaments won
        { "demo_user", (12, 5) }, // 12 missions, 5 tournaments
        { "newbie", (1, 0) },     // 1 mission, 0 tournaments
        { "elite", (50, 20) }     // 50 missions, 20 tournaments
    };

    // Static level definitions (simulates data from Smartico BackOffice)
    private static readonly List<Level> _levels = new()
    {
        new Level
        {
            Id = 1,
            Name = "Bronze",
            Description = "Your journey begins! Complete your first missions to start earning rewards.",
            Image = "https://images.example.com/levels/bronze-badge.png",
            RequiredPoints = 0,
            VisibilityPoints = 0,
            RequiredLevelCounter1 = null,
            RequiredLevelCounter2 = null,
            CustomData = "{\"color\":\"#CD7F32\",\"tier\":\"starter\"}"
        },
        new Level
        {
            Id = 2,
            Name = "Silver",
            Description = "You're gaining momentum! Keep playing to unlock even better rewards.",
            Image = "https://images.example.com/levels/silver-badge.png",
            RequiredPoints = 500,
            VisibilityPoints = 0,
            RequiredLevelCounter1 = null,
            RequiredLevelCounter2 = null,
            CustomData = "{\"color\":\"#C0C0C0\",\"tier\":\"intermediate\"}"
        },
        new Level
        {
            Id = 3,
            Name = "Gold",
            Description = "Impressive progress! You're now among the top players. Exclusive rewards await.",
            Image = "https://images.example.com/levels/gold-badge.png",
            RequiredPoints = 1000,
            VisibilityPoints = 500,
            RequiredLevelCounter1 = null,
            RequiredLevelCounter2 = null,
            CustomData = "{\"color\":\"#FFD700\",\"tier\":\"advanced\"}"
        },
        new Level
        {
            Id = 4,
            Name = "Platinum",
            Description = "Elite status achieved! You're in the top 10%. Enjoy premium benefits.",
            Image = "https://images.example.com/levels/platinum-badge.png",
            RequiredPoints = 3000,
            VisibilityPoints = 1000,
            RequiredLevelCounter1 = null,
            RequiredLevelCounter2 = null,
            CustomData = "{\"color\":\"#E5E4E2\",\"tier\":\"elite\"}"
        },
        new Level
        {
            Id = 5,
            Name = "Diamond",
            Description = "Extraordinary! You're among the best. Luxury rewards and VIP treatment unlocked.",
            Image = "https://images.example.com/levels/diamond-badge.png",
            RequiredPoints = 10000,
            VisibilityPoints = 3000,
            RequiredLevelCounter1 = null,
            RequiredLevelCounter2 = null,
            CustomData = "{\"color\":\"#B9F2FF\",\"tier\":\"master\"}"
        },
        new Level
        {
            Id = 6,
            Name = "Legend",
            Description = "You've reached legendary status! The ultimate rewards are yours. Welcome to the hall of fame.",
            Image = "https://images.example.com/levels/legend-badge.png",
            RequiredPoints = 20000,
            VisibilityPoints = 10000,
            RequiredLevelCounter1 = null,
            RequiredLevelCounter2 = null,
            CustomData = "{\"color\":\"#FF00FF\",\"tier\":\"legend\"}"
        },
        new Level
        {
            Id = 7,
            Name = "Mythic",
            Description = "Beyond legendary! You've achieved the impossible. Eternal glory and exclusive lifetime rewards.",
            Image = "https://images.example.com/levels/mythic-badge.png",
            RequiredPoints = 50000,
            VisibilityPoints = 20000,
            RequiredLevelCounter1 = null,
            RequiredLevelCounter2 = null,
            CustomData = "{\"color\":\"#8B00FF\",\"tier\":\"mythic\"}"
        }
    };

    public SmarticoLevelApiClient(ILogger<SmarticoLevelApiClient> logger)
    {
        _logger = logger;
    }

    public Task<List<Level>> GetLevelsAsync(string userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching levels for user {UserId}", userId);

        var userPoints = _userPoints.GetValueOrDefault(userId, 0);

        // Filter levels by visibility threshold
        var visibleLevels = _levels
            .Where(l => userPoints >= l.VisibilityPoints)
            .OrderBy(l => l.RequiredPoints)
            .ToList();

        _logger.LogInformation(
            "Returning {Count} visible levels for user {UserId} (Total points: {Points})",
            visibleLevels.Count,
            userId,
            userPoints
        );

        return Task.FromResult(visibleLevels);
    }

    public Task<UserLevelProgress?> GetUserLevelProgressAsync(string userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching level progress for user {UserId}", userId);

        var userPoints = _userPoints.GetValueOrDefault(userId, 0);
        var (counter1, counter2) = _userCounters.GetValueOrDefault(userId, (0, 0));

        // Find current level (highest level where user meets required_points)
        var currentLevel = _levels
            .Where(l => userPoints >= l.RequiredPoints)
            .OrderByDescending(l => l.RequiredPoints)
            .FirstOrDefault();

        // If user has 0 points and no level achieved yet
        if (currentLevel == null)
        {
            _logger.LogWarning("User {UserId} has no level data (0 points)", userId);
            return Task.FromResult<UserLevelProgress?>(null);
        }

        // Find next level (first level with higher required_points)
        var nextLevel = _levels
            .Where(l => l.RequiredPoints > currentLevel.RequiredPoints)
            .OrderBy(l => l.RequiredPoints)
            .FirstOrDefault();

        var progress = UserLevelProgress.Create(
            currentLevel,
            nextLevel,
            userPoints,
            counter1,
            counter2
        );

        _logger.LogInformation(
            "User {UserId} - Current: {CurrentLevel} ({CurrentPoints} pts), Next: {NextLevel}, Progress: {Progress}%",
            userId,
            currentLevel.Name,
            userPoints,
            nextLevel?.Name ?? "Max Level",
            progress.ProgressPercentage?.ToString("F2") ?? "N/A"
        );

        return Task.FromResult<UserLevelProgress?>(progress);
    }

    public Task<Level?> GetLevelByIdAsync(string userId, int levelId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching level {LevelId} for user {UserId}", levelId, userId);

        var userPoints = _userPoints.GetValueOrDefault(userId, 0);

        // Find level and check visibility
        var level = _levels.FirstOrDefault(l => l.Id == levelId);

        if (level == null)
        {
            _logger.LogWarning("Level {LevelId} not found", levelId);
            return Task.FromResult<Level?>(null);
        }

        // Check if level is visible to user
        if (userPoints < level.VisibilityPoints)
        {
            _logger.LogWarning(
                "Level {LevelId} not visible to user {UserId} (Points: {UserPoints}, Required: {VisibilityPoints})",
                levelId,
                userId,
                userPoints,
                level.VisibilityPoints
            );
            return Task.FromResult<Level?>(null);
        }

        return Task.FromResult<Level?>(level);
    }

    /// <summary>
    /// Demo helper: Add points to a user (for testing level-up scenarios).
    /// NOT part of ISmarticoLevelApiClient interface - demo only.
    /// </summary>
    public void AddPointsToUser(string userId, int points)
    {
        lock (_lock)
        {
            _userPoints[userId] = _userPoints.GetValueOrDefault(userId, 0) + points;
            _logger.LogInformation("Added {Points} points to user {UserId}. New total: {Total}",
                points, userId, _userPoints[userId]);
        }
    }
}
