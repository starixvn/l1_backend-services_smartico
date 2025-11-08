using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Enums;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Infrastructure.SmarticoApi;

/// <summary>
/// Tournament API client with in-memory demo data.
/// Provides 3 tournaments (upcoming, active, finished) with 50-participant leaderboards.
/// </summary>
public class SmarticoTournamentApiClient : ISmarticoTournamentApiClient
{
    private readonly ILogger<SmarticoTournamentApiClient> _logger;
    private readonly object _lock = new();

    // In-memory state for user registrations and tournament updates
    private readonly Dictionary<string, HashSet<int>> _userRegistrations = new();
    private readonly Dictionary<int, int> _tournamentRegistrationCounts = new()
    {
        { 1, 45 },  // Upcoming tournament - 45 registered
        { 2, 234 }, // Active tournament - 234 registered
        { 3, 500 }  // Finished tournament - 500 total participants
    };

    public SmarticoTournamentApiClient(ILogger<SmarticoTournamentApiClient> logger)
    {
        _logger = logger;
        InitializeDemoRegistrations();
    }

    private void InitializeDemoRegistrations()
    {
        // Pre-register demo users for some tournaments
        _userRegistrations["user123"] = new HashSet<int> { 2, 3 }; // Registered for active and finished
        _userRegistrations["demo_user"] = new HashSet<int> { 1, 2 }; // Registered for upcoming and active
    }

    public Task<List<Tournament>> GetTournamentsAsync(string userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching tournaments for user {UserId}", userId);

        var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var userRegistrations = _userRegistrations.GetValueOrDefault(userId) ?? new HashSet<int>();

        var tournaments = new List<Tournament>
        {
            // Tournament 1: UPCOMING - Free Entry
            new Tournament
            {
                InstanceId = 1,
                TournamentId = 101,
                Name = "Weekend Warrior Championship",
                Description = "Compete this weekend for exclusive prizes! Free entry for all players.",
                PrimaryImage = "https://images.example.com/tournaments/weekend-warrior.jpg",
                SecondaryImage = "https://images.example.com/tournaments/weekend-warrior-banner.jpg",
                MobileImage = "https://images.example.com/tournaments/weekend-warrior-mobile.jpg",
                PrizePoolSummary = "🏆 $5,000 Prize Pool + Exclusive Badges",
                CustomPriceText = null,
                StartTime = now + (24 * 60 * 60 * 1000), // Starts in 24 hours
                EndTime = now + (96 * 60 * 60 * 1000),   // Ends in 4 days
                RegistrationType = TournamentRegistrationType.Free,
                RegistrationCost = null,
                RegistrationCount = _tournamentRegistrationCounts[1],
                MinPlayers = 10,
                MaxPlayers = 100,
                Status = TournamentStatus.Register,
                IsActive = false,
                IsFinished = false,
                IsCancelled = false,
                CanRegister = true,
                IsUserRegistered = userRegistrations.Contains(1),
                Ribbon = TournamentRibbonType.New,
                Priority = 1,
                Section = "Featured",
                MinimumQualifyingScore = 1000,
                HideLeaderboardMinScores = false,
                SegmentDontMatchMessage = null,
                CustomData = null,
                Prizes = new List<TournamentPrize>
                {
                    new TournamentPrize { Id = 1, Name = "Champion's Crown", Description = "$2,000 Cash Prize + Gold Badge", ImageUrl = "https://images.example.com/prizes/crown.png", PlaceFrom = 1, PlaceTo = 1, PrizeType = TournamentPrizeType.RealMoney, PointValue = null },
                    new TournamentPrize { Id = 2, Name = "Silver Medal", Description = "$1,000 Cash Prize", ImageUrl = "https://images.example.com/prizes/silver.png", PlaceFrom = 2, PlaceTo = 2, PrizeType = TournamentPrizeType.RealMoney, PointValue = null },
                    new TournamentPrize { Id = 3, Name = "Bronze Medal", Description = "$500 Cash Prize", ImageUrl = "https://images.example.com/prizes/bronze.png", PlaceFrom = 3, PlaceTo = 3, PrizeType = TournamentPrizeType.RealMoney, PointValue = null },
                    new TournamentPrize { Id = 4, Name = "Top 10 Reward", Description = "500 Points Each", ImageUrl = null, PlaceFrom = 4, PlaceTo = 10, PrizeType = TournamentPrizeType.Points, PointValue = 500 },
                    new TournamentPrize { Id = 5, Name = "Participation Bonus", Description = "100 Points Each", ImageUrl = null, PlaceFrom = 11, PlaceTo = 100, PrizeType = TournamentPrizeType.Points, PointValue = 100 }
                },
                CurrentUserParticipation = userRegistrations.Contains(1)
                    ? new TournamentParticipant { PublicUsername = userId, AvatarUrl = $"https://avatars.example.com/{userId}.png", Position = 0, Score = 0, UserId = userId }
                    : null
            },

            // Tournament 2: ACTIVE - Paid Entry (Points)
            new Tournament
            {
                InstanceId = 2,
                TournamentId = 102,
                Name = "Grand Jackpot Showdown",
                Description = "The biggest tournament of the year! Compete for the $10,000 grand prize.",
                PrimaryImage = "https://images.example.com/tournaments/jackpot-showdown.jpg",
                SecondaryImage = "https://images.example.com/tournaments/jackpot-showdown-banner.jpg",
                MobileImage = "https://images.example.com/tournaments/jackpot-showdown-mobile.jpg",
                PrizePoolSummary = "💎 $10,000 Grand Prize + VIP Rewards",
                CustomPriceText = "500 Points Entry",
                StartTime = now - (12 * 60 * 60 * 1000), // Started 12 hours ago
                EndTime = now + (36 * 60 * 60 * 1000),   // Ends in 36 hours
                RegistrationType = TournamentRegistrationType.PaidPoints,
                RegistrationCost = 500,
                RegistrationCount = _tournamentRegistrationCounts[2],
                MinPlayers = 50,
                MaxPlayers = 500,
                Status = TournamentStatus.Started,
                IsActive = true,
                IsFinished = false,
                IsCancelled = false,
                CanRegister = false, // Registration closed after start
                IsUserRegistered = userRegistrations.Contains(2),
                Ribbon = TournamentRibbonType.Hot,
                Priority = 0, // Highest priority
                Section = "Featured",
                MinimumQualifyingScore = 5000,
                HideLeaderboardMinScores = true,
                SegmentDontMatchMessage = null,
                CustomData = "{\"sponsor\":\"MegaCorp\",\"prize_type\":\"cash\"}",
                Prizes = new List<TournamentPrize>
                {
                    new TournamentPrize { Id = 1, Name = "Grand Prize", Description = "$10,000 + VIP Status for 1 Year", ImageUrl = "https://images.example.com/prizes/grand.png", PlaceFrom = 1, PlaceTo = 1, PrizeType = TournamentPrizeType.RealMoney, PointValue = null },
                    new TournamentPrize { Id = 2, Name = "Runner-Up Prize", Description = "$5,000 + 6 Months VIP", ImageUrl = "https://images.example.com/prizes/runner-up.png", PlaceFrom = 2, PlaceTo = 2, PrizeType = TournamentPrizeType.RealMoney, PointValue = null },
                    new TournamentPrize { Id = 3, Name = "Third Place", Description = "$2,500", ImageUrl = "https://images.example.com/prizes/third.png", PlaceFrom = 3, PlaceTo = 3, PrizeType = TournamentPrizeType.RealMoney, PointValue = null },
                    new TournamentPrize { Id = 4, Name = "Top 10 Elite", Description = "$1,000 Each", ImageUrl = null, PlaceFrom = 4, PlaceTo = 10, PrizeType = TournamentPrizeType.RealMoney, PointValue = null },
                    new TournamentPrize { Id = 5, Name = "Top 50 Bonus", Description = "5,000 Points Each", ImageUrl = null, PlaceFrom = 11, PlaceTo = 50, PrizeType = TournamentPrizeType.Points, PointValue = 5000 },
                    new TournamentPrize { Id = 6, Name = "Qualifier Reward", Description = "1,000 Points Each", ImageUrl = null, PlaceFrom = 51, PlaceTo = 100, PrizeType = TournamentPrizeType.Points, PointValue = 1000 }
                },
                CurrentUserParticipation = userRegistrations.Contains(2)
                    ? new TournamentParticipant { PublicUsername = userId, AvatarUrl = $"https://avatars.example.com/{userId}.png", Position = 12, Score = 8450, UserId = userId }
                    : null
            },

            // Tournament 3: FINISHED - Paid Entry (Gems)
            new Tournament
            {
                InstanceId = 3,
                TournamentId = 103,
                Name = "Spring Championship 2025",
                Description = "The legendary Spring Championship has concluded! View final results and prize winners.",
                PrimaryImage = "https://images.example.com/tournaments/spring-championship.jpg",
                SecondaryImage = "https://images.example.com/tournaments/spring-championship-banner.jpg",
                MobileImage = "https://images.example.com/tournaments/spring-championship-mobile.jpg",
                PrizePoolSummary = "🌟 $25,000 Total Prize Pool",
                CustomPriceText = "250 Gems Entry",
                StartTime = now - (7 * 24 * 60 * 60 * 1000), // Started 7 days ago
                EndTime = now - (1 * 24 * 60 * 60 * 1000),   // Ended 1 day ago
                RegistrationType = TournamentRegistrationType.PaidGems,
                RegistrationCost = 250,
                RegistrationCount = _tournamentRegistrationCounts[3],
                MinPlayers = 100,
                MaxPlayers = 1000,
                Status = TournamentStatus.Finished,
                IsActive = false,
                IsFinished = true,
                IsCancelled = false,
                CanRegister = false,
                IsUserRegistered = userRegistrations.Contains(3),
                Ribbon = null,
                Priority = 10, // Lower priority (finished)
                Section = "Past Events",
                MinimumQualifyingScore = 10000,
                HideLeaderboardMinScores = true,
                SegmentDontMatchMessage = null,
                CustomData = "{\"season\":\"Spring2025\",\"edition\":3}",
                Prizes = new List<TournamentPrize>
                {
                    new TournamentPrize { Id = 1, Name = "Champion Title", Description = "$15,000 + Lifetime VIP + Trophy", ImageUrl = "https://images.example.com/prizes/champion.png", PlaceFrom = 1, PlaceTo = 1, PrizeType = TournamentPrizeType.RealMoney, PointValue = null },
                    new TournamentPrize { Id = 2, Name = "Runner-Up", Description = "$5,000", ImageUrl = "https://images.example.com/prizes/second.png", PlaceFrom = 2, PlaceTo = 2, PrizeType = TournamentPrizeType.RealMoney, PointValue = null },
                    new TournamentPrize { Id = 3, Name = "Third Place", Description = "$2,500", ImageUrl = "https://images.example.com/prizes/third.png", PlaceFrom = 3, PlaceTo = 3, PrizeType = TournamentPrizeType.RealMoney, PointValue = null },
                    new TournamentPrize { Id = 4, Name = "Top 10", Description = "$500 Each", ImageUrl = null, PlaceFrom = 4, PlaceTo = 10, PrizeType = TournamentPrizeType.RealMoney, PointValue = null },
                    new TournamentPrize { Id = 5, Name = "Top 50", Description = "10,000 Points Each", ImageUrl = null, PlaceFrom = 11, PlaceTo = 50, PrizeType = TournamentPrizeType.Points, PointValue = 10000 },
                    new TournamentPrize { Id = 6, Name = "Qualifier", Description = "5,000 Points Each", ImageUrl = null, PlaceFrom = 51, PlaceTo = 100, PrizeType = TournamentPrizeType.Points, PointValue = 5000 }
                },
                CurrentUserParticipation = userRegistrations.Contains(3)
                    ? new TournamentParticipant { PublicUsername = userId, AvatarUrl = $"https://avatars.example.com/{userId}.png", Position = 47, Score = 15230, UserId = userId }
                    : null
            }
        };

        _logger.LogInformation("Fetched {Count} tournaments for user {UserId}", tournaments.Count, userId);
        return Task.FromResult(tournaments);
    }

    public async Task<Tournament?> GetTournamentDetailsAsync(string userId, int tournamentInstanceId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching tournament details for instance {TournamentInstanceId}, user {UserId}",
            tournamentInstanceId, userId);

        var tournaments = await GetTournamentsAsync(userId, cancellationToken);
        var tournament = tournaments.FirstOrDefault(t => t.InstanceId == tournamentInstanceId);

        if (tournament == null)
        {
            _logger.LogWarning("Tournament instance {TournamentInstanceId} not found", tournamentInstanceId);
        }

        return tournament;
    }

    public Task<List<TournamentParticipant>> GetLeaderboardAsync(string userId, int tournamentInstanceId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching leaderboard for tournament {TournamentInstanceId}, user {UserId}",
            tournamentInstanceId, userId);

        // Generate demo leaderboard with 50 participants ranked by score
        var participants = new List<TournamentParticipant>();

        // Add top 50 participants with realistic scores
        for (int i = 1; i <= 50; i++)
        {
            var score = tournamentInstanceId switch
            {
                1 => 0, // Upcoming tournament - no scores yet
                2 => 50000 - (i * 800) + new Random(i).Next(-200, 200), // Active: 50000 down to ~10000
                3 => 75000 - (i * 1200) + new Random(i).Next(-300, 300), // Finished: 75000 down to ~15000
                _ => 0
            };

            participants.Add(new TournamentParticipant
            {
                PublicUsername = $"Player{i:D3}",
                AvatarUrl = $"https://avatars.example.com/player{i}.png",
                Position = i,
                Score = Math.Max(score, 0),
                ExternalUserId = $"ext_user_{i}",
                CrmBrandId = "brand_demo",
                UserId = $"user_{i}"
            });
        }

        // If user is registered, ensure they appear in leaderboard
        var userRegistrations = _userRegistrations.GetValueOrDefault(userId) ?? new HashSet<int>();
        if (userRegistrations.Contains(tournamentInstanceId))
        {
            var userInList = participants.Any(p => p.UserId == userId);
            if (!userInList)
            {
                // Add user at a mid-range position if not in top 50
                participants.Add(new TournamentParticipant
                {
                    PublicUsername = userId,
                    AvatarUrl = $"https://avatars.example.com/{userId}.png",
                    Position = 67,
                    Score = tournamentInstanceId == 2 ? 8450 : 12300,
                    ExternalUserId = $"ext_{userId}",
                    CrmBrandId = "brand_demo",
                    UserId = userId
                });
            }
        }

        _logger.LogInformation("Fetched leaderboard with {Count} participants for tournament {TournamentInstanceId}",
            participants.Count, tournamentInstanceId);

        return Task.FromResult(participants);
    }

    public async Task<RegisterTournamentResult> RegisterTournamentAsync(string userId, int tournamentInstanceId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Attempting to register user {UserId} for tournament {TournamentInstanceId}",
            userId, tournamentInstanceId);

        // Fetch tournament details to validate registration
        var tournament = await GetTournamentDetailsAsync(userId, tournamentInstanceId, cancellationToken);

        if (tournament == null)
        {
            _logger.LogWarning("Registration failed - tournament {TournamentInstanceId} not found", tournamentInstanceId);
            return RegisterTournamentResult.CreateFailure(
                TournamentRegistrationStatus.Failed,
                "Tournament not found");
        }

        // Validation checks
        lock (_lock)
        {
            var userRegistrations = _userRegistrations.GetValueOrDefault(userId) ?? new HashSet<int>();

            // Check if already registered
            if (userRegistrations.Contains(tournamentInstanceId))
            {
                _logger.LogWarning("Registration failed - user {UserId} already registered for tournament {TournamentInstanceId}",
                    userId, tournamentInstanceId);
                return RegisterTournamentResult.CreateFailure(
                    TournamentRegistrationStatus.AlreadyRegistered,
                    "You are already registered for this tournament");
            }

            // Check if tournament is cancelled
            if (tournament.IsCancelled)
            {
                return RegisterTournamentResult.CreateFailure(
                    TournamentRegistrationStatus.TournamentCancelled,
                    "This tournament has been cancelled");
            }

            // Check if registration is closed
            if (!tournament.CanRegister)
            {
                return RegisterTournamentResult.CreateFailure(
                    TournamentRegistrationStatus.RegistrationClosed,
                    "Registration period has ended for this tournament");
            }

            // Check max players limit
            if (tournament.MaxPlayers.HasValue && tournament.RegistrationCount >= tournament.MaxPlayers.Value)
            {
                return RegisterTournamentResult.CreateFailure(
                    TournamentRegistrationStatus.TournamentFull,
                    $"Tournament is full (maximum {tournament.MaxPlayers.Value} players)");
            }

            // Simulate balance check for paid tournaments (demo: always sufficient)
            if (tournament.RegistrationType != TournamentRegistrationType.Free && tournament.RegistrationCost.HasValue)
            {
                // In real implementation, check user's balance here
                var hasSufficientBalance = true; // Demo: always true

                if (!hasSufficientBalance)
                {
                    var currencyName = tournament.RegistrationType switch
                    {
                        TournamentRegistrationType.PaidPoints => "points",
                        TournamentRegistrationType.PaidGems => "gems",
                        TournamentRegistrationType.PaidDiamonds => "diamonds",
                        _ => "currency"
                    };

                    return RegisterTournamentResult.CreateFailure(
                        TournamentRegistrationStatus.InsufficientBalance,
                        $"Insufficient {currencyName}. Required: {tournament.RegistrationCost.Value}");
                }
            }

            // Register user
            if (!_userRegistrations.ContainsKey(userId))
            {
                _userRegistrations[userId] = new HashSet<int>();
            }
            _userRegistrations[userId].Add(tournamentInstanceId);

            // Update registration count
            if (_tournamentRegistrationCounts.ContainsKey(tournamentInstanceId))
            {
                _tournamentRegistrationCounts[tournamentInstanceId]++;
            }
            else
            {
                _tournamentRegistrationCounts[tournamentInstanceId] = 1;
            }

            _logger.LogInformation("Successfully registered user {UserId} for tournament {TournamentInstanceId}. New count: {Count}",
                userId, tournamentInstanceId, _tournamentRegistrationCounts[tournamentInstanceId]);
        }

        // Fetch updated tournament data
        var updatedTournament = await GetTournamentDetailsAsync(userId, tournamentInstanceId, cancellationToken);

        return RegisterTournamentResult.CreateSuccess(updatedTournament!);
    }
}
