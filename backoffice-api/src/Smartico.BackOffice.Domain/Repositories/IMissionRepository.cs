using MongoDB.Bson;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Domain.Repositories;

/// <summary>
/// Repository interface for Mission entity operations with operator-level isolation.
/// All methods automatically filter by OperatorId to ensure multi-tenant data separation.
/// </summary>
public interface IMissionRepository
{
    /// <summary>
    /// Creates a new mission in the database.
    /// </summary>
    /// <param name="mission">The mission entity to create.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task CreateAsync(Mission mission, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a mission by its ID for a specific operator.
    /// </summary>
    /// <param name="operatorId">The operator ID to filter by.</param>
    /// <param name="missionId">The mission ID to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>The mission if found and belongs to the operator, otherwise null.</returns>
    Task<Mission?> GetByIdAsync(ObjectId operatorId, ObjectId missionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all missions for a specific operator.
    /// </summary>
    /// <param name="operatorId">The operator ID to filter by.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>List of missions belonging to the operator, sorted by creation date descending.</returns>
    Task<List<Mission>> GetAllAsync(ObjectId operatorId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing mission.
    /// </summary>
    /// <param name="mission">The mission entity with updated values.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(Mission mission, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a mission by its ID for a specific operator.
    /// </summary>
    /// <param name="operatorId">The operator ID to filter by.</param>
    /// <param name="missionId">The mission ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(ObjectId operatorId, ObjectId missionId, CancellationToken cancellationToken = default);
}
