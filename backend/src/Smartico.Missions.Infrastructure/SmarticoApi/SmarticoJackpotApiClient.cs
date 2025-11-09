using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Enums;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Infrastructure.SmarticoApi;

/// <summary>
/// Jackpot API client with in-memory demo data.
/// Provides 5 demo jackpots (3 MultiUser, 2 Personal) with realistic pool amounts and temperatures.
/// </summary>
public class SmarticoJackpotApiClient : ISmarticoJackpotApiClient
{
    private readonly ILogger<SmarticoJackpotApiClient> _logger;
    private readonly object _lock = new();

    // Demo data: Jackpot templates with current pot states
    private static readonly List<JackpotDetails> _jackpots = new()
    {
        // JP-1: Mega Jackpot (MultiUser, Percentage 5%, HOT)
        new JackpotDetails
        {
            JpTemplateId = 1,
            JpTypeId = JackpotType.MultiUser,
            JpCurrency = "Points",
            UserCurrency = "USD",
            ContributionType = JackpotContributionType.Percentage,
            ContributionValue = 5.0m,
            Pot = new JackpotPot
            {
                JpPotId = 101,
                JpTemplateId = 1,
                CurrentPotAmount = 50000m,
                CurrentPotAmountUserCurrency = 500.00m,
                CurrentPotTemperature = JackPotTemperature.HOT,
                ExploseDateTs = DateTimeOffset.UtcNow.AddDays(2).ToUnixTimeMilliseconds()
            },
            RegistrationCount = 312,
            IsOptedIn = false,
            AchRelatedGameAllowAll = true,
            ExposeWinnersOverApi = true,
            JpPublicMeta = new JackpotPublicMeta
            {
                Name = "Mega Jackpot",
                Description = "Join thousands of players competing for a massive shared prize pool!",
                ImageUrl = "https://images.example.com/jackpots/mega-jackpot.png",
                Placeholder1 = "next_draw_date",
                Placeholder2 = "all_time_winners_count",
                CustomData = "{\"sponsorBrand\":\"BetKing\",\"promoCode\":\"MEGA25\"}"
            },
            MinAmount = 5000m,
            MaxAmount = 100000m,
            SeedAmount = 1000m
        },
        // JP-2: Community Pot (MultiUser, Fixed 10pts, WARM)
        new JackpotDetails
        {
            JpTemplateId = 2,
            JpTypeId = JackpotType.MultiUser,
            JpCurrency = "Points",
            UserCurrency = "USD",
            ContributionType = JackpotContributionType.Fixed,
            ContributionValue = 10m,
            Pot = new JackpotPot
            {
                JpPotId = 102,
                JpTemplateId = 2,
                CurrentPotAmount = 4950m,
                CurrentPotAmountUserCurrency = 49.50m,
                CurrentPotTemperature = JackPotTemperature.WARM,
                ExploseDateTs = DateTimeOffset.UtcNow.AddDays(3).ToUnixTimeMilliseconds()
            },
            RegistrationCount = 125,
            IsOptedIn = false,
            AchRelatedGameAllowAll = true,
            ExposeWinnersOverApi = true,
            JpPublicMeta = new JackpotPublicMeta
            {
                Name = "Community Pot",
                Description = "Small bets, big wins! Contribute 10 points per bet to this community jackpot.",
                ImageUrl = "https://images.example.com/jackpots/community-pot.png",
                Placeholder1 = null,
                Placeholder2 = null,
                CustomData = null
            },
            MinAmount = 5000m,
            MaxAmount = 10000m,
            SeedAmount = 500m
        },
        // JP-3: Grand Prize (MultiUser, Percentage 3%, BURNING)
        new JackpotDetails
        {
            JpTemplateId = 3,
            JpTypeId = JackpotType.MultiUser,
            JpCurrency = "Points",
            UserCurrency = "USD",
            ContributionType = JackpotContributionType.Percentage,
            ContributionValue = 3.0m,
            Pot = new JackpotPot
            {
                JpPotId = 103,
                JpTemplateId = 3,
                CurrentPotAmount = 95000m,
                CurrentPotAmountUserCurrency = 950.00m,
                CurrentPotTemperature = JackPotTemperature.BURNING,
                ExploseDateTs = DateTimeOffset.UtcNow.AddHours(6).ToUnixTimeMilliseconds()
            },
            RegistrationCount = 587,
            IsOptedIn = false,
            AchRelatedGameAllowAll = true,
            ExposeWinnersOverApi = true,
            JpPublicMeta = new JackpotPublicMeta
            {
                Name = "Grand Prize",
                Description = "The ultimate prize pool! Exploding soon - don't miss your chance!",
                ImageUrl = "https://images.example.com/jackpots/grand-prize.png",
                Placeholder1 = "vip_only",
                Placeholder2 = "high_roller",
                CustomData = "{\"minBet\":100,\"eligibility\":\"vip\"}"
            },
            MinAmount = 50000m,
            MaxAmount = 100000m,
            SeedAmount = 10000m
        },
        // JP-4: Personal Vault (Personal, Fixed 5pts, COLD)
        new JackpotDetails
        {
            JpTemplateId = 4,
            JpTypeId = JackpotType.Personal,
            JpCurrency = "Points",
            UserCurrency = "USD",
            ContributionType = JackpotContributionType.Fixed,
            ContributionValue = 5m,
            Pot = new JackpotPot
            {
                JpPotId = 104,
                JpTemplateId = 4,
                CurrentPotAmount = 120m,
                CurrentPotAmountUserCurrency = 1.20m,
                CurrentPotTemperature = JackPotTemperature.COLD,
                ExploseDateTs = DateTimeOffset.UtcNow.AddDays(10).ToUnixTimeMilliseconds()
            },
            RegistrationCount = 1,
            IsOptedIn = false,
            AchRelatedGameAllowAll = true,
            ExposeWinnersOverApi = true,
            JpPublicMeta = new JackpotPublicMeta
            {
                Name = "Personal Vault",
                Description = "Your private jackpot! Build your own prize pool with every bet.",
                ImageUrl = "https://images.example.com/jackpots/personal-vault.png",
                Placeholder1 = null,
                Placeholder2 = null,
                CustomData = null
            },
            MinAmount = 1000m,
            MaxAmount = 5000m,
            SeedAmount = 50m
        },
        // JP-5: Lucky Draw (Personal, Percentage 2%, WARM)
        new JackpotDetails
        {
            JpTemplateId = 5,
            JpTypeId = JackpotType.Personal,
            JpCurrency = "Gems",
            UserCurrency = "USD",
            ContributionType = JackpotContributionType.Percentage,
            ContributionValue = 2.0m,
            Pot = new JackpotPot
            {
                JpPotId = 105,
                JpTemplateId = 5,
                CurrentPotAmount = 980m,
                CurrentPotAmountUserCurrency = 9.80m,
                CurrentPotTemperature = JackPotTemperature.WARM,
                ExploseDateTs = DateTimeOffset.UtcNow.AddDays(5).ToUnixTimeMilliseconds()
            },
            RegistrationCount = 1,
            IsOptedIn = false,
            AchRelatedGameAllowAll = true,
            ExposeWinnersOverApi = true,
            JpPublicMeta = new JackpotPublicMeta
            {
                Name = "Lucky Draw",
                Description = "Small contributions, lucky rewards! Perfect for casual players.",
                ImageUrl = "https://images.example.com/jackpots/lucky-draw.png",
                Placeholder1 = "beginner_friendly",
                Placeholder2 = null,
                CustomData = "{\"tier\":\"beginner\"}"
            },
            MinAmount = 500m,
            MaxAmount = 2000m,
            SeedAmount = 100m
        }
    };

    // Demo data: User opt-in records (userId -> set of template IDs)
    private static readonly ConcurrentDictionary<string, HashSet<int>> _userOptIns = new()
    {
        ["user123"] = new HashSet<int> { 1, 2, 4 },    // Opted in to Mega Jackpot, Community Pot, Personal Vault
        ["demo_user"] = new HashSet<int> { 3 },         // Opted in to Grand Prize
        ["elite"] = new HashSet<int> { 1, 2, 3, 4, 5 } // Opted in to all jackpots
    };

    // Demo data: Recent winners (last 30 days)
    private static readonly List<JackpotWinner> _winners = new()
    {
        new JackpotWinner
        {
            JpPotId = 100, // Previous pot of Mega Jackpot
            IsMe = false,
            PublicUsername = "J***n",
            AvatarId = "avatar_001",
            WinningAmountJpCurrency = 45000m,
            WinningAmountWalletCurrency = 450.00m,
            WinningPosition = 1,
            WinDateTs = DateTimeOffset.UtcNow.AddDays(-2).ToUnixTimeMilliseconds(),
            JackpotName = "Mega Jackpot"
        },
        new JackpotWinner
        {
            JpPotId = 100,
            IsMe = false,
            PublicUsername = "M***e",
            AvatarId = "avatar_002",
            WinningAmountJpCurrency = 10000m,
            WinningAmountWalletCurrency = 100.00m,
            WinningPosition = 2,
            WinDateTs = DateTimeOffset.UtcNow.AddDays(-2).ToUnixTimeMilliseconds(),
            JackpotName = "Mega Jackpot"
        },
        new JackpotWinner
        {
            JpPotId = 100,
            IsMe = false,
            PublicUsername = "A***a",
            AvatarId = "avatar_003",
            WinningAmountJpCurrency = 5000m,
            WinningAmountWalletCurrency = 50.00m,
            WinningPosition = 3,
            WinDateTs = DateTimeOffset.UtcNow.AddDays(-2).ToUnixTimeMilliseconds(),
            JackpotName = "Mega Jackpot"
        },
        new JackpotWinner
        {
            JpPotId = 99, // Previous pot of Community Pot
            IsMe = false,
            PublicUsername = "S***h",
            AvatarId = "avatar_004",
            WinningAmountJpCurrency = 9500m,
            WinningAmountWalletCurrency = 95.00m,
            WinningPosition = 1,
            WinDateTs = DateTimeOffset.UtcNow.AddDays(-5).ToUnixTimeMilliseconds(),
            JackpotName = "Community Pot"
        },
        new JackpotWinner
        {
            JpPotId = 98, // Previous Personal Vault pot
            IsMe = false,
            PublicUsername = "R***t",
            AvatarId = "avatar_005",
            WinningAmountJpCurrency = 4800m,
            WinningAmountWalletCurrency = 48.00m,
            WinningPosition = 1,
            WinDateTs = DateTimeOffset.UtcNow.AddDays(-7).ToUnixTimeMilliseconds(),
            JackpotName = "Personal Vault"
        }
    };

    public SmarticoJackpotApiClient(ILogger<SmarticoJackpotApiClient> logger)
    {
        _logger = logger;
    }

    public async Task<List<JackpotDetails>> GetJackpotsAsync(string userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching jackpots for user {UserId}", userId);

        // Simulate API delay
        await Task.Delay(50, cancellationToken);

        var userOptIns = _userOptIns.GetValueOrDefault(userId, new HashSet<int>());

        // Return jackpots with user-specific opt-in status
        var jackpots = _jackpots.Select(j => j with
        {
            IsOptedIn = userOptIns.Contains(j.JpTemplateId),
            // For Personal jackpots, registration count always 1 if opted in
            RegistrationCount = j.JpTypeId == JackpotType.Personal && userOptIns.Contains(j.JpTemplateId) ? 1 : j.RegistrationCount
        }).ToList();

        _logger.LogInformation(
            "Returning {Count} jackpots for user {UserId}",
            jackpots.Count,
            userId
        );

        return jackpots;
    }

    public async Task<JackpotDetails?> GetJackpotByIdAsync(int templateId, string userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching jackpot {TemplateId} for user {UserId}", templateId, userId);

        // Simulate API delay
        await Task.Delay(50, cancellationToken);

        var jackpot = _jackpots.FirstOrDefault(j => j.JpTemplateId == templateId);
        if (jackpot == null)
        {
            _logger.LogWarning("Jackpot {TemplateId} not found", templateId);
            return null;
        }

        var userOptIns = _userOptIns.GetValueOrDefault(userId, new HashSet<int>());
        return jackpot with
        {
            IsOptedIn = userOptIns.Contains(templateId),
            RegistrationCount = jackpot.JpTypeId == JackpotType.Personal && userOptIns.Contains(templateId) ? 1 : jackpot.RegistrationCount
        };
    }

    public async Task<JackpotDetails> OptInAsync(string userId, int templateId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("User {UserId} opting in to jackpot {TemplateId}", userId, templateId);

        // Simulate API delay
        await Task.Delay(50, cancellationToken);

        var jackpot = _jackpots.FirstOrDefault(j => j.JpTemplateId == templateId);
        if (jackpot == null)
        {
            throw new InvalidOperationException($"Jackpot {templateId} not found");
        }

        lock (_lock)
        {
            var userOptIns = _userOptIns.GetOrAdd(userId, _ => new HashSet<int>());
            if (userOptIns.Contains(templateId))
            {
                throw new InvalidOperationException($"User {userId} already opted in to jackpot {templateId}");
            }

            userOptIns.Add(templateId);

            // Increment registration count for MultiUser jackpots
            if (jackpot.JpTypeId == JackpotType.MultiUser)
            {
                var index = _jackpots.FindIndex(j => j.JpTemplateId == templateId);
                _jackpots[index] = jackpot with { RegistrationCount = jackpot.RegistrationCount + 1 };
                jackpot = _jackpots[index];
            }

            _logger.LogInformation(
                "User {UserId} successfully opted in to jackpot {TemplateId}. New registration count: {Count}",
                userId,
                templateId,
                jackpot.RegistrationCount
            );

            return jackpot with { IsOptedIn = true };
        }
    }

    public async Task<JackpotDetails> OptOutAsync(string userId, int templateId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("User {UserId} opting out of jackpot {TemplateId}", userId, templateId);

        // Simulate API delay
        await Task.Delay(50, cancellationToken);

        var jackpot = _jackpots.FirstOrDefault(j => j.JpTemplateId == templateId);
        if (jackpot == null)
        {
            throw new InvalidOperationException($"Jackpot {templateId} not found");
        }

        lock (_lock)
        {
            var userOptIns = _userOptIns.GetValueOrDefault(userId, new HashSet<int>());
            if (!userOptIns.Contains(templateId))
            {
                throw new InvalidOperationException($"User {userId} not opted in to jackpot {templateId}");
            }

            userOptIns.Remove(templateId);

            // Decrement registration count for MultiUser jackpots
            if (jackpot.JpTypeId == JackpotType.MultiUser)
            {
                var index = _jackpots.FindIndex(j => j.JpTemplateId == templateId);
                _jackpots[index] = jackpot with { RegistrationCount = Math.Max(0, jackpot.RegistrationCount - 1) };
                jackpot = _jackpots[index];
            }

            _logger.LogInformation(
                "User {UserId} successfully opted out of jackpot {TemplateId}. New registration count: {Count}",
                userId,
                templateId,
                jackpot.RegistrationCount
            );

            return jackpot with { IsOptedIn = false };
        }
    }

    public async Task<List<JackpotWinner>> GetWinnersAsync(string userId, JackpotType? filterType = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching winners for user {UserId}, filter: {FilterType}", userId, filterType);

        // Simulate API delay
        await Task.Delay(50, cancellationToken);

        var winners = _winners.Select(w => w with
        {
            // Set IsMe flag if winner is current user
            IsMe = w.PublicUsername.Replace("*", "").Equals(userId, StringComparison.OrdinalIgnoreCase)
        }).ToList();

        // Apply type filter if specified (would need to join with jackpots in real implementation)
        // For demo, we just return all winners

        _logger.LogInformation("Returning {Count} winners for user {UserId}", winners.Count, userId);

        return winners;
    }
}
