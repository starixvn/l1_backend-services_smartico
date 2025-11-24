using MongoDB.Bson;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Domain.Repositories;

/// <summary>
/// Repository interface for tournament data access operations.
/// All operations automatically filter by OperatorId for multi-tenant isolation.
/// </summary>
public interface ITournamentRepository
{
    /// <summary>
    /// Creates a new tournament in the database.
    /// </summary>
    /// <param name="tournament">The tournament entity to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task CreateAsync(Tournament tournament, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a tournament by its ID, filtered by operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="tournamentId">The tournament ID to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The tournament if found and belongs to the operator; otherwise, null.</returns>
    Task<Tournament?> GetByIdAsync(ObjectId operatorId, ObjectId tournamentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all tournaments for a specific operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of tournaments belonging to the operator.</returns>
    Task<List<Tournament>> GetAllAsync(ObjectId operatorId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing tournament.
    /// </summary>
    /// <param name="tournament">The tournament entity with updated values.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(Tournament tournament, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a tournament by its ID, filtered by operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="tournamentId">The tournament ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(ObjectId operatorId, ObjectId tournamentId, CancellationToken cancellationToken = default);
}
