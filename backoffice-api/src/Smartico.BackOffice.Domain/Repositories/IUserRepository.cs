using MongoDB.Bson;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Domain.Repositories;

/// <summary>
/// Repository interface for User entity operations with operator-level isolation.
/// All methods automatically filter by OperatorId to ensure multi-tenant data separation.
/// </summary>
public interface IUserRepository
{
    /// <summary>
    /// Creates a new user in the database.
    /// </summary>
    /// <param name="user">The user entity to create.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task CreateAsync(User user, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a user by its ID for a specific operator.
    /// </summary>
    /// <param name="operatorId">The operator ID to filter by.</param>
    /// <param name="userId">The user ID to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>The user if found and belongs to the operator, otherwise null.</returns>
    Task<User?> GetByIdAsync(ObjectId operatorId, ObjectId userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a user by email for a specific operator.
    /// Used for authentication and duplicate email checking.
    /// </summary>
    /// <param name="operatorId">The operator ID to filter by.</param>
    /// <param name="email">The email address to search for.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>The user if found, otherwise null.</returns>
    Task<User?> GetByEmailAsync(ObjectId operatorId, string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all users for a specific operator.
    /// </summary>
    /// <param name="operatorId">The operator ID to filter by.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>List of users belonging to the operator, sorted by creation date descending.</returns>
    Task<List<User>> GetAllAsync(ObjectId operatorId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing user.
    /// </summary>
    /// <param name="user">The user entity with updated values.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(User user, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a user by its ID for a specific operator.
    /// </summary>
    /// <param name="operatorId">The operator ID to filter by.</param>
    /// <param name="userId">The user ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(ObjectId operatorId, ObjectId userId, CancellationToken cancellationToken = default);
}
