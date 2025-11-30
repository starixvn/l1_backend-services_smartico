using MongoDB.Bson;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Domain.Repositories;

/// <summary>
/// Repository interface for Badge entity operations.
/// All operations are scoped by operatorId for multi-tenant isolation.
/// </summary>
public interface IBadgeRepository
{
    /// <summary>
    /// Gets all badges for an operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for tenant isolation.</param>
    /// <returns>List of badges belonging to the operator.</returns>
    Task<IEnumerable<Badge>> GetAllAsync(ObjectId operatorId);

    /// <summary>
    /// Gets a badge by ID, scoped by operator.
    /// </summary>
    /// <param name="id">The badge ID.</param>
    /// <param name="operatorId">The operator ID for tenant isolation.</param>
    /// <returns>The badge if found, null otherwise.</returns>
    Task<Badge?> GetByIdAsync(ObjectId id, ObjectId operatorId);

    /// <summary>
    /// Gets all badges in a specific series.
    /// </summary>
    /// <param name="seriesId">The badge series ID.</param>
    /// <param name="operatorId">The operator ID for tenant isolation.</param>
    /// <returns>List of badges in the series, ordered by orderInSeries.</returns>
    Task<IEnumerable<Badge>> GetBySeriesIdAsync(ObjectId seriesId, ObjectId operatorId);

    /// <summary>
    /// Gets all active badges for an operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for tenant isolation.</param>
    /// <returns>List of active badges.</returns>
    Task<IEnumerable<Badge>> GetActiveAsync(ObjectId operatorId);

    /// <summary>
    /// Creates a new badge.
    /// </summary>
    /// <param name="badge">The badge to create.</param>
    /// <returns>The created badge with generated ID.</returns>
    Task<Badge> CreateAsync(Badge badge);

    /// <summary>
    /// Updates an existing badge.
    /// </summary>
    /// <param name="badge">The badge with updated values.</param>
    /// <returns>True if updated, false if not found.</returns>
    Task<bool> UpdateAsync(Badge badge);

    /// <summary>
    /// Deletes a badge by ID, scoped by operator.
    /// </summary>
    /// <param name="id">The badge ID.</param>
    /// <param name="operatorId">The operator ID for tenant isolation.</param>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeleteAsync(ObjectId id, ObjectId operatorId);

    /// <summary>
    /// Increments the unlock count for a badge.
    /// Called when a player unlocks the badge.
    /// </summary>
    /// <param name="id">The badge ID.</param>
    /// <param name="operatorId">The operator ID for tenant isolation.</param>
    /// <returns>True if updated, false if not found.</returns>
    Task<bool> IncrementUnlockCountAsync(ObjectId id, ObjectId operatorId);
}
