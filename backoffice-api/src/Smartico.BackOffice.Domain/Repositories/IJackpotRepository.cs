using MongoDB.Bson;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Domain.Repositories;

/// <summary>
/// Repository interface for Jackpot entity operations.
/// All operations are scoped by operatorId for multi-tenant isolation.
/// </summary>
public interface IJackpotRepository
{
    /// <summary>
    /// Gets all jackpots for an operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for tenant isolation.</param>
    /// <returns>List of jackpots belonging to the operator.</returns>
    Task<IEnumerable<Jackpot>> GetAllAsync(ObjectId operatorId);

    /// <summary>
    /// Gets a jackpot by ID, scoped by operator.
    /// </summary>
    /// <param name="id">The jackpot ID.</param>
    /// <param name="operatorId">The operator ID for tenant isolation.</param>
    /// <returns>The jackpot if found, null otherwise.</returns>
    Task<Jackpot?> GetByIdAsync(ObjectId id, ObjectId operatorId);

    /// <summary>
    /// Gets all active jackpots for an operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for tenant isolation.</param>
    /// <returns>List of active jackpots.</returns>
    Task<IEnumerable<Jackpot>> GetActiveAsync(ObjectId operatorId);

    /// <summary>
    /// Gets jackpots by status for an operator.
    /// </summary>
    /// <param name="status">The jackpot status to filter by.</param>
    /// <param name="operatorId">The operator ID for tenant isolation.</param>
    /// <returns>List of jackpots with the specified status.</returns>
    Task<IEnumerable<Jackpot>> GetByStatusAsync(JackpotStatus status, ObjectId operatorId);

    /// <summary>
    /// Creates a new jackpot.
    /// </summary>
    /// <param name="jackpot">The jackpot to create.</param>
    /// <returns>The created jackpot with generated ID.</returns>
    Task<Jackpot> CreateAsync(Jackpot jackpot);

    /// <summary>
    /// Updates an existing jackpot.
    /// </summary>
    /// <param name="jackpot">The jackpot with updated values.</param>
    /// <returns>True if updated, false if not found.</returns>
    Task<bool> UpdateAsync(Jackpot jackpot);

    /// <summary>
    /// Deletes a jackpot by ID, scoped by operator.
    /// </summary>
    /// <param name="id">The jackpot ID.</param>
    /// <param name="operatorId">The operator ID for tenant isolation.</param>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeleteAsync(ObjectId id, ObjectId operatorId);

    /// <summary>
    /// Updates a specific tier's current value.
    /// Used when contributions are made to the jackpot.
    /// </summary>
    /// <param name="id">The jackpot ID.</param>
    /// <param name="tierId">The tier ID within the jackpot.</param>
    /// <param name="newValue">The new current value for the tier.</param>
    /// <param name="operatorId">The operator ID for tenant isolation.</param>
    /// <returns>True if updated, false if not found.</returns>
    Task<bool> UpdateTierValueAsync(ObjectId id, string tierId, decimal newValue, ObjectId operatorId);

    /// <summary>
    /// Records a jackpot win event.
    /// Updates last won info and resets tier value based on reset behavior.
    /// </summary>
    /// <param name="id">The jackpot ID.</param>
    /// <param name="tierId">The tier ID that was won.</param>
    /// <param name="winnerId">The player ID who won.</param>
    /// <param name="winAmount">The amount won.</param>
    /// <param name="operatorId">The operator ID for tenant isolation.</param>
    /// <returns>True if updated, false if not found.</returns>
    Task<bool> RecordWinAsync(ObjectId id, string tierId, string winnerId, decimal winAmount, ObjectId operatorId);
}
