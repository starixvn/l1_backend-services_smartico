using MongoDB.Bson;
using Smartico.BackOffice.Application.BadgeSeries.Commands;
using Smartico.BackOffice.Application.Badges.DTOs;

namespace Smartico.BackOffice.Application.BadgeSeries.Interfaces;

/// <summary>
/// Service interface for badge series operations.
/// </summary>
public interface IBadgeSeriesService
{
    /// <summary>
    /// Gets all badge series for the current operator.
    /// </summary>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>List of badge series DTOs.</returns>
    Task<IEnumerable<BadgeSeriesDto>> GetAllAsync(ObjectId operatorId);

    /// <summary>
    /// Gets a badge series by ID with its badges.
    /// </summary>
    /// <param name="id">The series ID.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>The badge series DTO if found, null otherwise.</returns>
    Task<BadgeSeriesDto?> GetByIdAsync(string id, ObjectId operatorId);

    /// <summary>
    /// Gets all active badge series for the current operator.
    /// </summary>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>List of active badge series DTOs.</returns>
    Task<IEnumerable<BadgeSeriesDto>> GetActiveAsync(ObjectId operatorId);

    /// <summary>
    /// Creates a new badge series.
    /// </summary>
    /// <param name="command">The create badge series command.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>The created badge series DTO.</returns>
    Task<BadgeSeriesDto> CreateAsync(CreateBadgeSeriesCommand command, ObjectId operatorId);

    /// <summary>
    /// Updates an existing badge series.
    /// </summary>
    /// <param name="id">The series ID to update.</param>
    /// <param name="command">The update badge series command.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>The updated badge series DTO if found, null otherwise.</returns>
    Task<BadgeSeriesDto?> UpdateAsync(string id, UpdateBadgeSeriesCommand command, ObjectId operatorId);

    /// <summary>
    /// Publishes (activates) a badge series.
    /// </summary>
    /// <param name="id">The series ID to publish.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>True if published, false if not found.</returns>
    Task<bool> PublishAsync(string id, ObjectId operatorId);

    /// <summary>
    /// Archives a badge series.
    /// </summary>
    /// <param name="id">The series ID to archive.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>True if archived, false if not found.</returns>
    Task<bool> ArchiveAsync(string id, ObjectId operatorId);

    /// <summary>
    /// Deletes a badge series.
    /// </summary>
    /// <param name="id">The series ID to delete.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeleteAsync(string id, ObjectId operatorId);
}
