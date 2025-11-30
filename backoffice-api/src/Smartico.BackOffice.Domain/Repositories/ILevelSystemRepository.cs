using MongoDB.Bson;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Domain.Repositories;

/// <summary>
/// Repository interface for level system data access operations.
/// All operations automatically filter by OperatorId for multi-tenant isolation.
/// </summary>
public interface ILevelSystemRepository
{
    /// <summary>
    /// Creates a new level system in the database.
    /// </summary>
    /// <param name="levelSystem">The level system entity to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task CreateAsync(LevelSystem levelSystem, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a level system by its ID, filtered by operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="levelSystemId">The level system ID to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The level system if found and belongs to the operator; otherwise, null.</returns>
    Task<LevelSystem?> GetByIdAsync(ObjectId operatorId, ObjectId levelSystemId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all level systems for a specific operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of level systems belonging to the operator.</returns>
    Task<List<LevelSystem>> GetAllAsync(ObjectId operatorId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves the active level system for a specific operator.
    /// Only one level system can be active per operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The active level system if found; otherwise, null.</returns>
    Task<LevelSystem?> GetActiveAsync(ObjectId operatorId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves level systems by status for a specific operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="status">The level system status to filter by.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of level systems matching the status.</returns>
    Task<List<LevelSystem>> GetByStatusAsync(ObjectId operatorId, LevelSystemStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing level system.
    /// </summary>
    /// <param name="levelSystem">The level system entity with updated values.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(LevelSystem levelSystem, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a level system by its ID, filtered by operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="levelSystemId">The level system ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(ObjectId operatorId, ObjectId levelSystemId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a level system name is already in use for a specific operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="name">The name to check.</param>
    /// <param name="excludeId">Optional ID to exclude from the check (for updates).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the name is already in use; otherwise, false.</returns>
    Task<bool> IsNameInUseAsync(ObjectId operatorId, string name, ObjectId? excludeId = null, CancellationToken cancellationToken = default);
}
