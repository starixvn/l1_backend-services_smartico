using MongoDB.Bson;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Domain.Repositories;

/// <summary>
/// Repository interface for BadgeSeries entity operations.
/// All operations are scoped by operatorId for multi-tenant isolation.
/// </summary>
public interface IBadgeSeriesRepository
{
    /// <summary>
    /// Gets all badge series for an operator, ordered by displayOrder.
    /// </summary>
    /// <param name="operatorId">The operator ID for tenant isolation.</param>
    /// <returns>List of badge series belonging to the operator.</returns>
    Task<IEnumerable<BadgeSeries>> GetAllAsync(ObjectId operatorId);

    /// <summary>
    /// Gets a badge series by ID, scoped by operator.
    /// </summary>
    /// <param name="id">The badge series ID.</param>
    /// <param name="operatorId">The operator ID for tenant isolation.</param>
    /// <returns>The badge series if found, null otherwise.</returns>
    Task<BadgeSeries?> GetByIdAsync(ObjectId id, ObjectId operatorId);

    /// <summary>
    /// Gets all active badge series for an operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for tenant isolation.</param>
    /// <returns>List of active badge series.</returns>
    Task<IEnumerable<BadgeSeries>> GetActiveAsync(ObjectId operatorId);

    /// <summary>
    /// Creates a new badge series.
    /// </summary>
    /// <param name="series">The badge series to create.</param>
    /// <returns>The created badge series with generated ID.</returns>
    Task<BadgeSeries> CreateAsync(BadgeSeries series);

    /// <summary>
    /// Updates an existing badge series.
    /// </summary>
    /// <param name="series">The badge series with updated values.</param>
    /// <returns>True if updated, false if not found.</returns>
    Task<bool> UpdateAsync(BadgeSeries series);

    /// <summary>
    /// Deletes a badge series by ID, scoped by operator.
    /// Note: Should check for associated badges before deletion.
    /// </summary>
    /// <param name="id">The badge series ID.</param>
    /// <param name="operatorId">The operator ID for tenant isolation.</param>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeleteAsync(ObjectId id, ObjectId operatorId);
}
