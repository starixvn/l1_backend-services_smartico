using Smartico.Missions.Domain.Enums;

namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents the result of a tournament registration attempt.
/// </summary>
public class RegisterTournamentResult
{
    /// <summary>
    /// Indicates if registration was successful.
    /// </summary>
    public required bool Success { get; init; }

    /// <summary>
    /// Registration status code.
    /// </summary>
    public required TournamentRegistrationStatus Status { get; init; }

    /// <summary>
    /// Error message if registration failed (null on success).
    /// </summary>
    public string? ErrorMessage { get; init; }

    /// <summary>
    /// Updated tournament instance after registration (null if registration failed).
    /// </summary>
    public Tournament? UpdatedTournament { get; init; }

    /// <summary>
    /// Creates a successful registration result.
    /// </summary>
    public static RegisterTournamentResult CreateSuccess(Tournament updatedTournament)
    {
        return new RegisterTournamentResult
        {
            Success = true,
            Status = TournamentRegistrationStatus.Registered,
            UpdatedTournament = updatedTournament,
            ErrorMessage = null
        };
    }

    /// <summary>
    /// Creates a failed registration result.
    /// </summary>
    public static RegisterTournamentResult CreateFailure(TournamentRegistrationStatus status, string errorMessage)
    {
        return new RegisterTournamentResult
        {
            Success = false,
            Status = status,
            ErrorMessage = errorMessage,
            UpdatedTournament = null
        };
    }
}
