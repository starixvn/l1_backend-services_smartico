using MongoDB.Bson;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.Missions.Domain.Interfaces;

/// <summary>
/// Read-only repository for accessing jackpots from the shared MongoDB database.
/// Data is written by backoffice-api and read by this backend API.
/// </summary>
public interface IJackpotReadRepository
{
    /// <summary>
    /// Gets all active jackpots for a specific operator.
    /// Only returns jackpots with Status = Active.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of active jackpots.</returns>
    Task<List<Jackpot>> GetActiveJackpotsAsync(ObjectId operatorId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a specific jackpot by ID for an operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="jackpotId">The jackpot ID to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The jackpot if found, otherwise null.</returns>
    Task<Jackpot?> GetByIdAsync(ObjectId operatorId, ObjectId jackpotId, CancellationToken cancellationToken = default);
}
