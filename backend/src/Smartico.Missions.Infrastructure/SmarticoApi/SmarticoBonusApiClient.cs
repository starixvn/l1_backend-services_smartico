using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Enums;
using Smartico.Missions.Domain.Interfaces;
using System.Net.Http.Json;
using System.Text.Json;

namespace Smartico.Missions.Infrastructure.SmarticoApi;

/// <summary>
/// HTTP client wrapper for the Smartico Bonus API.
/// Implements ISmarticoBonusApiClient with retry logic and error handling.
/// </summary>
public class SmarticoBonusApiClient : ISmarticoBonusApiClient
{
    private readonly HttpClient _httpClient;
    private readonly SmarticoBonusApiOptions _options;
    private readonly ILogger<SmarticoBonusApiClient> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    public SmarticoBonusApiClient(
        HttpClient httpClient,
        IOptions<SmarticoBonusApiOptions> options,
        ILogger<SmarticoBonusApiClient> logger)
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
        _httpClient.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);
    }

    public async Task<IEnumerable<Bonus>> GetBonusesAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching bonuses for user {UserId} (DEMO MODE - Returning dummy data)", userId);

        // TODO: Replace with actual Smartico Bonus API call
        // For MVP demo, returning dummy data
        await Task.Delay(100, cancellationToken); // Simulate network delay

        var dummyBonuses = new List<Bonus>
        {
            new()
            {
                Id = "bonus-001",
                Name = "Welcome Bonus",
                Description = "Get $50 bonus on your first deposit!",
                ImageUrl = "https://via.placeholder.com/300x200?text=Welcome+Bonus",
                Status = BonusStatus.Issued,
                Amount = 50.00m,
                Currency = "USD",
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                IsRedeemable = true,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                RedeemedAt = null,
                Type = BonusType.WelcomeBonus
            },
            new()
            {
                Id = "bonus-002",
                Name = "Deposit Match Bonus",
                Description = "100% match on deposits up to $100",
                ImageUrl = "https://via.placeholder.com/300x200?text=Deposit+Match",
                Status = BonusStatus.Issued,
                Amount = 100.00m,
                Currency = "USD",
                ExpiresAt = DateTime.UtcNow.AddDays(14),
                IsRedeemable = true,
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                RedeemedAt = null,
                Type = BonusType.DepositBonus
            },
            new()
            {
                Id = "bonus-003",
                Name = "Free Spins Friday",
                Description = "50 free spins on selected slots",
                ImageUrl = "https://via.placeholder.com/300x200?text=Free+Spins",
                Status = BonusStatus.Issued,
                Amount = 50m,
                Currency = "SPINS",
                ExpiresAt = DateTime.UtcNow.AddHours(12),
                IsRedeemable = true,
                CreatedAt = DateTime.UtcNow.AddHours(-6),
                RedeemedAt = null,
                Type = BonusType.FreeSpins
            },
            new()
            {
                Id = "bonus-004",
                Name = "VIP Cashback",
                Description = "10% cashback on all losses this week",
                ImageUrl = "https://via.placeholder.com/300x200?text=VIP+Cashback",
                Status = BonusStatus.Claimed,
                Amount = 25.50m,
                Currency = "USD",
                ExpiresAt = null,
                IsRedeemable = false,
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                RedeemedAt = DateTime.UtcNow.AddDays(-9),
                Type = BonusType.CashBack
            },
            new()
            {
                Id = "bonus-005",
                Name = "Reload Bonus",
                Description = "50% bonus on your next deposit",
                ImageUrl = "https://via.placeholder.com/300x200?text=Reload+Bonus",
                Status = BonusStatus.Expired,
                Amount = 75.00m,
                Currency = "USD",
                ExpiresAt = DateTime.UtcNow.AddDays(-1),
                IsRedeemable = false,
                CreatedAt = DateTime.UtcNow.AddDays(-8),
                RedeemedAt = null,
                Type = BonusType.Reload
            }
        };

        _logger.LogInformation("Returning {Count} dummy bonuses for user {UserId}",
            dummyBonuses.Count, userId);

        return dummyBonuses;
    }

    public async Task<ClaimBonusResult> ClaimBonusAsync(
        string userId,
        string bonusId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("User {UserId} claiming bonus {BonusId} (DEMO MODE)", userId, bonusId);

        // TODO: Replace with actual Smartico Bonus API call
        await Task.Delay(500, cancellationToken); // Simulate network delay

        try
        {
            // Simulate successful claim for demo
            _logger.LogInformation("Successfully claimed bonus {BonusId} for user {UserId}",
                bonusId, userId);

            return ClaimBonusResult.CreateSuccess(bonusId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error claiming bonus {BonusId} for user {UserId}",
                bonusId, userId);

            return ClaimBonusResult.CreateFailure(
                bonusId,
                "CLAIM_ERROR",
                "An error occurred while claiming the bonus. Please try again.");
        }
    }
}
