using MongoDB.Bson;

namespace Smartico.Missions.Domain.Interfaces;

/// <summary>
/// Repository for player progress tracking in the shared MongoDB database.
/// Handles read/write operations for player state (mission progress, badges earned, jackpot opt-ins).
/// </summary>
public interface IPlayerProgressRepository
{
    /// <summary>
    /// Gets player progress for a specific player and operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="playerId">The player ID (external user ID).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The player progress if found, otherwise null.</returns>
    Task<PlayerProgress?> GetByPlayerIdAsync(ObjectId operatorId, string playerId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates or updates player progress.
    /// </summary>
    /// <param name="progress">The player progress to upsert.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task UpsertAsync(PlayerProgress progress, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a jackpot opt-in for a player.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="playerId">The player ID (external user ID).</param>
    /// <param name="jackpotId">The jackpot ID to opt into.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task AddJackpotOptInAsync(ObjectId operatorId, string playerId, string jackpotId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Removes a jackpot opt-in for a player.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="playerId">The player ID (external user ID).</param>
    /// <param name="jackpotId">The jackpot ID to opt out of.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task RemoveJackpotOptInAsync(ObjectId operatorId, string playerId, string jackpotId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Tracks player progress for missions, badges, and jackpots.
/// One document per player per operator.
/// </summary>
public class PlayerProgress
{
    /// <summary>
    /// MongoDB document ID.
    /// </summary>
    public ObjectId Id { get; set; }

    /// <summary>
    /// Operator this player belongs to (multi-tenant isolation).
    /// </summary>
    public ObjectId OperatorId { get; set; }

    /// <summary>
    /// External player identifier (from userId parameter).
    /// </summary>
    public string PlayerId { get; set; } = string.Empty;

    /// <summary>
    /// Progress for each mission. Key is mission ObjectId as string.
    /// </summary>
    public Dictionary<string, MissionProgressData> MissionProgress { get; set; } = new();

    /// <summary>
    /// List of badges earned by this player.
    /// </summary>
    public List<EarnedBadge> BadgesEarned { get; set; } = new();

    /// <summary>
    /// List of jackpot ObjectIds the player has opted into.
    /// </summary>
    public List<string> JackpotOptIns { get; set; } = new();

    /// <summary>
    /// Contributions to each jackpot. Key is jackpot ObjectId as string.
    /// </summary>
    public Dictionary<string, decimal> JackpotContributions { get; set; } = new();

    /// <summary>
    /// Current player level.
    /// </summary>
    public int Level { get; set; } = 1;

    /// <summary>
    /// Current XP points.
    /// </summary>
    public int Xp { get; set; } = 0;

    /// <summary>
    /// When the record was created.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When the record was last updated.
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Progress data for a single mission.
/// </summary>
public class MissionProgressData
{
    /// <summary>
    /// Progress per task. Key is task ID.
    /// </summary>
    public Dictionary<string, int> TaskProgress { get; set; } = new();

    /// <summary>
    /// Total current value (for single-task missions).
    /// </summary>
    public int CurrentValue { get; set; }

    /// <summary>
    /// When the mission was completed, or null if not completed.
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// When the reward was claimed, or null if not claimed.
    /// </summary>
    public DateTime? ClaimedAt { get; set; }
}

/// <summary>
/// Record of an earned badge.
/// </summary>
public class EarnedBadge
{
    /// <summary>
    /// Badge ObjectId as string.
    /// </summary>
    public string BadgeId { get; set; } = string.Empty;

    /// <summary>
    /// When the badge was earned.
    /// </summary>
    public DateTime EarnedAt { get; set; }
}
