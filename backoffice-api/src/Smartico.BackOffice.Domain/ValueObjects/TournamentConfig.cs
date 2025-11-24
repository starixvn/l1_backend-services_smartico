namespace Smartico.BackOffice.Domain.ValueObjects;

/// <summary>
/// Defines the type of tournament.
/// </summary>
public enum TournamentType
{
    /// <summary>
    /// Leaderboard-based tournament where players compete for top positions.
    /// </summary>
    Leaderboard,

    /// <summary>
    /// Bracket-style tournament with elimination rounds.
    /// </summary>
    Bracket,

    /// <summary>
    /// Time-based challenge where players complete objectives within a time window.
    /// </summary>
    TimeBasedChallenge
}

/// <summary>
/// Defines how scores are calculated in a tournament.
/// </summary>
public enum ScoringType
{
    /// <summary>
    /// Score based on accumulated points.
    /// </summary>
    Points,

    /// <summary>
    /// Score based on the highest single win amount.
    /// </summary>
    HighestWin,

    /// <summary>
    /// Score based on the total number of wins.
    /// </summary>
    MostWins,

    /// <summary>
    /// Score based on total wagering volume.
    /// </summary>
    WageringVolume
}

/// <summary>
/// Defines the current status of a tournament.
/// </summary>
public enum TournamentStatus
{
    /// <summary>
    /// Tournament is being configured and not yet published.
    /// </summary>
    Draft,

    /// <summary>
    /// Tournament is scheduled to start at a future date.
    /// </summary>
    Scheduled,

    /// <summary>
    /// Tournament is currently active and accepting participants.
    /// </summary>
    Active,

    /// <summary>
    /// Tournament has ended and winners have been determined.
    /// </summary>
    Completed,

    /// <summary>
    /// Tournament was cancelled before completion.
    /// </summary>
    Cancelled
}

/// <summary>
/// Defines the prize type for tournament winners.
/// </summary>
public enum PrizeType
{
    /// <summary>
    /// Cash prize.
    /// </summary>
    Cash,

    /// <summary>
    /// Free spins reward.
    /// </summary>
    FreeSpins,

    /// <summary>
    /// Bonus credit.
    /// </summary>
    BonusCredit
}

/// <summary>
/// Represents a prize distribution for a specific position in the tournament.
/// </summary>
/// <param name="Position">The position in the tournament (1 for first place, 2 for second, etc.).</param>
/// <param name="PrizeAmount">The amount of the prize.</param>
/// <param name="PrizeType">The type of prize (Cash, FreeSpins, BonusCredit).</param>
public record PrizeDistribution(
    int Position,
    decimal PrizeAmount,
    PrizeType PrizeType
);
