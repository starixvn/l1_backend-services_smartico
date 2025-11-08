using Smartico.Missions.Domain.Enums;

namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents a competitive tournament event with defined rules, timeline, and rewards.
/// </summary>
public class Tournament
{
    /// <summary>
    /// Unique identifier for this specific tournament instance.
    /// </summary>
    public required int InstanceId { get; init; }

    /// <summary>
    /// Tournament template identifier (recurring tournaments share the same TournamentId).
    /// </summary>
    public required int TournamentId { get; init; }

    /// <summary>
    /// Tournament display name (user-facing, translated).
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Tournament description explaining rules and objectives.
    /// </summary>
    public required string Description { get; init; }

    /// <summary>
    /// Primary tournament image URL.
    /// </summary>
    public string? PrimaryImage { get; init; }

    /// <summary>
    /// Secondary tournament image URL.
    /// </summary>
    public string? SecondaryImage { get; init; }

    /// <summary>
    /// Mobile-optimized tournament image URL.
    /// </summary>
    public string? MobileImage { get; init; }

    /// <summary>
    /// Prize pool summary message displayed to users.
    /// </summary>
    public string? PrizePoolSummary { get; init; }

    /// <summary>
    /// Custom pricing text (overrides default registration cost display).
    /// </summary>
    public string? CustomPriceText { get; init; }

    /// <summary>
    /// Tournament start time (UTC epoch milliseconds).
    /// </summary>
    public required long StartTime { get; init; }

    /// <summary>
    /// Tournament end time (UTC epoch milliseconds).
    /// </summary>
    public required long EndTime { get; init; }

    /// <summary>
    /// Registration type determining entry requirements.
    /// </summary>
    public required TournamentRegistrationType RegistrationType { get; init; }

    /// <summary>
    /// Registration cost amount (applies to PaidPoints, PaidGems, PaidDiamonds types).
    /// </summary>
    public decimal? RegistrationCost { get; init; }

    /// <summary>
    /// Current number of registered participants.
    /// </summary>
    public int RegistrationCount { get; init; }

    /// <summary>
    /// Minimum required participants for tournament to start.
    /// </summary>
    public int? MinPlayers { get; init; }

    /// <summary>
    /// Maximum allowed participants (tournament closes when reached).
    /// </summary>
    public int? MaxPlayers { get; init; }

    /// <summary>
    /// Tournament status indicating current state.
    /// </summary>
    public required TournamentStatus Status { get; init; }

    /// <summary>
    /// Indicates if tournament is currently active.
    /// </summary>
    public bool IsActive { get; init; }

    /// <summary>
    /// Indicates if tournament has finished.
    /// </summary>
    public bool IsFinished { get; init; }

    /// <summary>
    /// Indicates if tournament was cancelled.
    /// </summary>
    public bool IsCancelled { get; init; }

    /// <summary>
    /// Indicates if user can register for this tournament.
    /// </summary>
    public bool CanRegister { get; init; }

    /// <summary>
    /// Indicates if current user is registered for this tournament.
    /// </summary>
    public bool IsUserRegistered { get; init; }

    /// <summary>
    /// Featured tournament ribbon type (sale, hot, new, vip, custom).
    /// </summary>
    public TournamentRibbonType? Ribbon { get; init; }

    /// <summary>
    /// Priority for ordering tournaments (lower values appear first).
    /// </summary>
    public int Priority { get; init; }

    /// <summary>
    /// Custom section assignment for grouping tournaments.
    /// </summary>
    public string? Section { get; init; }

    /// <summary>
    /// Minimum score required to qualify for prizes.
    /// </summary>
    public int? MinimumQualifyingScore { get; init; }

    /// <summary>
    /// If true, participants below qualifying score are hidden from leaderboard.
    /// </summary>
    public bool HideLeaderboardMinScores { get; init; }

    /// <summary>
    /// Message displayed to users who don't meet segment eligibility conditions.
    /// </summary>
    public string? SegmentDontMatchMessage { get; init; }

    /// <summary>
    /// Custom operator-provided data (flexible JSON object).
    /// </summary>
    public string? CustomData { get; init; }

    /// <summary>
    /// Prize structure for this tournament.
    /// </summary>
    public List<TournamentPrize> Prizes { get; init; } = new();

    /// <summary>
    /// Current user's participation details (if registered).
    /// </summary>
    public TournamentParticipant? CurrentUserParticipation { get; init; }
}
