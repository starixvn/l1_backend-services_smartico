using MongoDB.Bson;
using Smartico.BackOffice.Application.Tournaments.Commands;
using Smartico.BackOffice.Application.Tournaments.DTOs;

namespace Smartico.BackOffice.Application.Tournaments.Interfaces;

/// <summary>
/// Service interface for tournament business logic operations.
/// </summary>
public interface ITournamentService
{
    /// <summary>
    /// Creates a new tournament for the specified operator.
    /// </summary>
    /// <param name="operatorId">The operator ID creating the tournament.</param>
    /// <param name="command">The tournament creation command.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created tournament as a DTO.</returns>
    Task<TournamentDto> CreateTournamentAsync(
        ObjectId operatorId,
        CreateTournamentCommand command,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a tournament by its ID for the specified operator.
    /// </summary>
    /// <param name="operatorId">The operator ID requesting the tournament.</param>
    /// <param name="tournamentId">The tournament ID to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The tournament DTO if found; otherwise, null.</returns>
    Task<TournamentDto?> GetTournamentByIdAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all tournaments for the specified operator.
    /// </summary>
    /// <param name="operatorId">The operator ID requesting tournaments.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of tournament DTOs.</returns>
    Task<List<TournamentDto>> GetAllTournamentsAsync(
        ObjectId operatorId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing tournament.
    /// </summary>
    /// <param name="operatorId">The operator ID updating the tournament.</param>
    /// <param name="tournamentId">The tournament ID to update.</param>
    /// <param name="command">The updated tournament data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated tournament DTO.</returns>
    Task<TournamentDto> UpdateTournamentAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        CreateTournamentCommand command,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a tournament.
    /// </summary>
    /// <param name="operatorId">The operator ID deleting the tournament.</param>
    /// <param name="tournamentId">The tournament ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteTournamentAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        CancellationToken cancellationToken = default);
}
