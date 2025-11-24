using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using Smartico.BackOffice.Application.Leaderboard.DTOs;
using Smartico.BackOffice.Application.Leaderboard.Interfaces;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;

namespace Smartico.BackOffice.Application.Leaderboard.Services;

/// <summary>
/// Service for leaderboard operations.
/// </summary>
public class LeaderboardService : ILeaderboardService
{
    private readonly ILeaderboardRepository _leaderboardRepository;
    private readonly ILogger<LeaderboardService> _logger;

    public LeaderboardService(
        ILeaderboardRepository leaderboardRepository,
        ILogger<LeaderboardService> logger)
    {
        _leaderboardRepository = leaderboardRepository;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<List<LeaderboardEntryDto>> GetLeaderboardAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        int limit = 100,
        CancellationToken cancellationToken = default)
    {
        var entries = await _leaderboardRepository.GetLeaderboardAsync(
            operatorId,
            tournamentId,
            limit,
            cancellationToken);

        return entries.Select(MapToDto).ToList();
    }

    /// <inheritdoc/>
    public async Task<LeaderboardEntryDto?> GetPlayerPositionAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        string playerId,
        CancellationToken cancellationToken = default)
    {
        var entry = await _leaderboardRepository.GetPlayerEntryAsync(
            operatorId,
            tournamentId,
            playerId,
            cancellationToken);

        return entry == null ? null : MapToDto(entry);
    }

    /// <inheritdoc/>
    public async Task<int> GenerateMockLeaderboardAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        int entryCount = 50,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Generating {EntryCount} mock leaderboard entries for tournament {TournamentId}",
            entryCount,
            tournamentId);

        var random = new Random();
        var playerNames = GeneratePlayerNames(entryCount);

        // Generate entries with random scores
        var entries = new List<LeaderboardEntry>();
        for (int i = 0; i < entryCount; i++)
        {
            var score = random.Next(100, 10000);
            entries.Add(new LeaderboardEntry
            {
                Id = ObjectId.GenerateNewId(),
                OperatorId = operatorId,
                TournamentId = tournamentId,
                PlayerId = $"player_{i + 1:D3}",
                PlayerName = playerNames[i],
                Score = score,
                Rank = 0, // Will be calculated
                LastUpdated = DateTime.UtcNow.AddMinutes(-random.Next(0, 120)),
                AvatarUrl = $"https://i.pravatar.cc/150?u={i}",
                Metadata = new Dictionary<string, object>
                {
                    ["gamesPlayed"] = random.Next(5, 50),
                    ["wins"] = random.Next(1, 30),
                    ["level"] = random.Next(1, 100)
                }
            });
        }

        // Sort by score descending and assign ranks
        entries = entries.OrderByDescending(e => e.Score).ToList();
        for (int i = 0; i < entries.Count; i++)
        {
            entries[i].Rank = i + 1;
        }

        // Upsert all entries
        foreach (var entry in entries)
        {
            await _leaderboardRepository.UpsertEntryAsync(entry, cancellationToken);
        }

        _logger.LogInformation("Generated {Count} mock leaderboard entries", entries.Count);
        return entries.Count;
    }

    private static LeaderboardEntryDto MapToDto(LeaderboardEntry entry)
    {
        return new LeaderboardEntryDto
        {
            Id = entry.Id.ToString(),
            TournamentId = entry.TournamentId.ToString(),
            PlayerId = entry.PlayerId,
            PlayerName = entry.PlayerName,
            Rank = entry.Rank,
            Score = entry.Score,
            LastUpdated = entry.LastUpdated,
            AvatarUrl = entry.AvatarUrl,
            Metadata = entry.Metadata
        };
    }

    private static List<string> GeneratePlayerNames(int count)
    {
        var firstNames = new[] {
            "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Skylar",
            "Cameron", "Dakota", "Avery", "Parker", "Reese", "Blake", "Sage", "Rowan",
            "Phoenix", "Charlie", "Finley", "Emerson", "River", "Drew", "Peyton", "Hayden",
            "Kai", "Remy", "Devon", "Logan", "Mika", "Ash"
        };

        var lastNames = new[] {
            "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
            "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
            "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White",
            "Harris", "Clark", "Lewis", "Walker", "Hall", "Young", "King"
        };

        var random = new Random();
        var names = new List<string>();

        for (int i = 0; i < count; i++)
        {
            var firstName = firstNames[random.Next(firstNames.Length)];
            var lastName = lastNames[random.Next(lastNames.Length)];
            names.Add($"{firstName} {lastName}");
        }

        return names;
    }
}
