using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Enums;
using Smartico.Missions.Domain.Interfaces;
using System.Net.Http.Json;
using System.Text.Json;

namespace Smartico.Missions.Infrastructure.SmarticoApi;

/// <summary>
/// HTTP client wrapper for the Smartico Public API.
/// Implements ISmarticoApiClient with retry logic and error handling.
/// </summary>
public class SmarticoApiClient : ISmarticoApiClient
{
    private readonly HttpClient _httpClient;
    private readonly SmarticoApiOptions _options;
    private readonly ILogger<SmarticoApiClient> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    public SmarticoApiClient(
        HttpClient httpClient,
        IOptions<SmarticoApiOptions> options,
        ILogger<SmarticoApiClient> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;

        // Configure JSON serialization options
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        // Configure HttpClient base address and headers
        _httpClient.BaseAddress = new Uri(_options.BaseUrl);
        _httpClient.DefaultRequestHeaders.Add("X-API-Key", _options.ApiKey);
        _httpClient.DefaultRequestHeaders.Add("X-Brand-Key", _options.BrandKey);
        _httpClient.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);
    }

    public async Task<IEnumerable<Mission>> GetMissionsAsync(
        string extUserId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching missions for user {ExtUserId} (DEMO MODE - Returning dummy data)", extUserId);

        // TODO: Replace with actual Smartico API call
        // For MVP demo, returning dummy data
        await Task.Delay(100, cancellationToken); // Simulate network delay

        var dummyMissions = new List<Mission>
        {
            new()
            {
                Id = 1,
                Name = "Daily Login Streak",
                Description = "Log in for 7 consecutive days to complete this mission",
                Type = AchievementType.Mission,
                Status = AchievementStatus.Active,
                Progress = 57,
                Tasks = new List<MissionTask>
                {
                    new() { Id = "1", Description = "Login on Day 1", CurrentValue = 1, TargetValue = 1, Progress = 100, IsCompleted = true, Order = 1 },
                    new() { Id = "2", Description = "Login on Day 2", CurrentValue = 1, TargetValue = 1, Progress = 100, IsCompleted = true, Order = 2 },
                    new() { Id = "3", Description = "Login on Day 3", CurrentValue = 1, TargetValue = 1, Progress = 100, IsCompleted = true, Order = 3 },
                    new() { Id = "4", Description = "Login on Day 4", CurrentValue = 1, TargetValue = 1, Progress = 100, IsCompleted = true, Order = 4 },
                    new() { Id = "5", Description = "Login on Day 5", CurrentValue = 0, TargetValue = 1, Progress = 0, IsCompleted = false, Order = 5 },
                    new() { Id = "6", Description = "Login on Day 6", CurrentValue = 0, TargetValue = 1, Progress = 0, IsCompleted = false, Order = 6 },
                    new() { Id = "7", Description = "Login on Day 7", CurrentValue = 0, TargetValue = 1, Progress = 0, IsCompleted = false, Order = 7 }
                },
                RewardAmount = 100,
                RewardCurrency = "points",
                ExpiresAt = DateTime.UtcNow.AddDays(3),
                IsRecurring = true,
                CompletionCount = 2,
                Category = "Daily",
                RelatedGames = new List<string> { "Slots", "Roulette" }
            },
            new()
            {
                Id = 2,
                Name = "First Deposit Bonus",
                Description = "Make your first deposit of $20 or more",
                Type = AchievementType.Mission,
                Status = AchievementStatus.Available,
                Progress = 0,
                Tasks = new List<MissionTask>
                {
                    new() { Id = "1", Description = "Deposit $20 or more", CurrentValue = 0, TargetValue = 20, Progress = 0, IsCompleted = false, Order = 1 }
                },
                RewardAmount = 500,
                RewardCurrency = "bonus credits",
                IsRecurring = false,
                CompletionCount = 0,
                Category = "Deposit",
                RelatedGames = new List<string>()
            },
            new()
            {
                Id = 3,
                Name = "Slot Master Challenge",
                Description = "Win 50 spins on any slot game",
                Type = AchievementType.Mission,
                Status = AchievementStatus.Completed,
                Progress = 100,
                Tasks = new List<MissionTask>
                {
                    new() { Id = "1", Description = "Win 50 slot spins", CurrentValue = 50, TargetValue = 50, Progress = 100, IsCompleted = true, Order = 1 }
                },
                RewardAmount = 250,
                RewardCurrency = "points",
                IsRecurring = false,
                CompletionCount = 1,
                Category = "Gaming",
                RelatedGames = new List<string> { "Mega Slots", "Lucky 7s", "Diamond Spins" }
            }
        };

        _logger.LogInformation("Returning {Count} dummy missions for user {ExtUserId}",
            dummyMissions.Count, extUserId);

        return dummyMissions;
    }

    public async Task<Mission?> GetMissionByIdAsync(
        string extUserId,
        int missionId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching mission {MissionId} for user {ExtUserId}",
            missionId, extUserId);

        try
        {
            // TODO: Replace with actual Smartico API endpoint
            var response = await _httpClient.GetAsync(
                $"/api/achievements/{missionId}?userId={extUserId}",
                cancellationToken);

            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                _logger.LogWarning("Mission {MissionId} not found for user {ExtUserId}",
                    missionId, extUserId);
                return null;
            }

            response.EnsureSuccessStatusCode();

            var mission = await response.Content.ReadFromJsonAsync<Mission>(
                _jsonOptions,
                cancellationToken);

            _logger.LogInformation("Successfully fetched mission {MissionId} for user {ExtUserId}",
                missionId, extUserId);

            return mission;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error fetching mission {MissionId} for user {ExtUserId}",
                missionId, extUserId);
            throw new InvalidOperationException($"Failed to fetch mission {missionId}", ex);
        }
    }

    public async Task<MissionOptInResult> OptInToMissionAsync(
        string extUserId,
        int missionId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("User {ExtUserId} opting into mission {MissionId}",
            extUserId, missionId);

        try
        {
            // TODO: Replace with actual Smartico API endpoint
            var response = await _httpClient.PostAsJsonAsync(
                $"/api/achievements/{missionId}/optin",
                new { userId = extUserId },
                cancellationToken);

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<MissionOptInResult>(
                _jsonOptions,
                cancellationToken);

            _logger.LogInformation("Successfully opted user {ExtUserId} into mission {MissionId}",
                extUserId, missionId);

            return result ?? new MissionOptInResult
            {
                Success = false,
                Message = "Unknown error occurred"
            };
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error opting into mission {MissionId} for user {ExtUserId}",
                missionId, extUserId);
            return new MissionOptInResult
            {
                Success = false,
                Message = "Failed to opt into mission",
                ErrorCode = "HTTP_ERROR"
            };
        }
    }

    public async Task<MissionClaimResult> ClaimRewardAsync(
        string extUserId,
        int missionId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("User {ExtUserId} claiming reward for mission {MissionId}",
            extUserId, missionId);

        try
        {
            // TODO: Replace with actual Smartico API endpoint
            var response = await _httpClient.PostAsJsonAsync(
                $"/api/achievements/{missionId}/claim",
                new { userId = extUserId },
                cancellationToken);

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<MissionClaimResult>(
                _jsonOptions,
                cancellationToken);

            _logger.LogInformation("Successfully claimed reward for mission {MissionId} by user {ExtUserId}",
                missionId, extUserId);

            return result ?? new MissionClaimResult
            {
                Success = false,
                Message = "Unknown error occurred"
            };
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error claiming reward for mission {MissionId} by user {ExtUserId}",
                missionId, extUserId);
            return new MissionClaimResult
            {
                Success = false,
                Message = "Failed to claim reward",
                ErrorCode = "HTTP_ERROR"
            };
        }
    }

    public async Task<IEnumerable<Badge>> GetBadgesAsync(
        string extUserId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching badges for user {ExtUserId}", extUserId);

        try
        {
            // TODO: Replace with actual Smartico API endpoint
            var response = await _httpClient.GetAsync(
                $"/api/achievements?userId={extUserId}&type=badge",
                cancellationToken);

            response.EnsureSuccessStatusCode();

            var badges = await response.Content.ReadFromJsonAsync<IEnumerable<Badge>>(
                _jsonOptions,
                cancellationToken);

            _logger.LogInformation("Successfully fetched {Count} badges for user {ExtUserId}",
                badges?.Count() ?? 0, extUserId);

            return badges ?? Enumerable.Empty<Badge>();
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error fetching badges for user {ExtUserId}", extUserId);
            throw new InvalidOperationException("Failed to fetch badges from Smartico API", ex);
        }
    }

    public async Task<Badge?> GetBadgeByIdAsync(
        string extUserId,
        int badgeId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching badge {BadgeId} for user {ExtUserId}",
            badgeId, extUserId);

        try
        {
            // TODO: Replace with actual Smartico API endpoint
            var response = await _httpClient.GetAsync(
                $"/api/achievements/{badgeId}?userId={extUserId}&type=badge",
                cancellationToken);

            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                _logger.LogWarning("Badge {BadgeId} not found for user {ExtUserId}",
                    badgeId, extUserId);
                return null;
            }

            response.EnsureSuccessStatusCode();

            var badge = await response.Content.ReadFromJsonAsync<Badge>(
                _jsonOptions,
                cancellationToken);

            _logger.LogInformation("Successfully fetched badge {BadgeId} for user {ExtUserId}",
                badgeId, extUserId);

            return badge;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error fetching badge {BadgeId} for user {ExtUserId}",
                badgeId, extUserId);
            throw new InvalidOperationException($"Failed to fetch badge {badgeId}", ex);
        }
    }
}

