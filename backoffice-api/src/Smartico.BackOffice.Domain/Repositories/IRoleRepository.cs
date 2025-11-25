using MongoDB.Bson;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Domain.Repositories;

/// <summary>
/// Repository interface for Role entity operations with operator-level isolation.
/// All methods automatically filter by OperatorId to ensure multi-tenant data separation.
/// </summary>
public interface IRoleRepository
{
    /// <summary>
    /// Creates a new role in the database.
    /// </summary>
    /// <param name="role">The role entity to create.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task CreateAsync(Role role, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a role by its ID for a specific operator.
    /// </summary>
    /// <param name="operatorId">The operator ID to filter by.</param>
    /// <param name="roleId">The role ID to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>The role if found and belongs to the operator, otherwise null.</returns>
    Task<Role?> GetByIdAsync(ObjectId operatorId, ObjectId roleId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves multiple roles by their IDs for a specific operator.
    /// Used for loading user roles efficiently.
    /// </summary>
    /// <param name="operatorId">The operator ID to filter by.</param>
    /// <param name="roleIds">The list of role IDs to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>List of roles that were found.</returns>
    Task<List<Role>> GetByIdsAsync(ObjectId operatorId, List<ObjectId> roleIds, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all roles for a specific operator.
    /// </summary>
    /// <param name="operatorId">The operator ID to filter by.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>List of roles belonging to the operator, sorted by creation date descending.</returns>
    Task<List<Role>> GetAllAsync(ObjectId operatorId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing role.
    /// </summary>
    /// <param name="role">The role entity with updated values.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(Role role, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a role by its ID for a specific operator.
    /// System roles cannot be deleted.
    /// </summary>
    /// <param name="operatorId">The operator ID to filter by.</param>
    /// <param name="roleId">The role ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(ObjectId operatorId, ObjectId roleId, CancellationToken cancellationToken = default);
}
