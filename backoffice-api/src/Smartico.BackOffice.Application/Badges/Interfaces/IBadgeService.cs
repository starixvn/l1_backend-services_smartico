using MongoDB.Bson;
using Smartico.BackOffice.Application.Badges.Commands;
using Smartico.BackOffice.Application.Badges.DTOs;

namespace Smartico.BackOffice.Application.Badges.Interfaces;

/// <summary>
/// Service interface for badge operations.
/// </summary>
public interface IBadgeService
{
    /// <summary>
    /// Gets all badges for the current operator.
    /// </summary>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>List of badge DTOs.</returns>
    Task<IEnumerable<BadgeDto>> GetAllAsync(ObjectId operatorId);

    /// <summary>
    /// Gets a badge by ID.
    /// </summary>
    /// <param name="id">The badge ID.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>The badge DTO if found, null otherwise.</returns>
    Task<BadgeDto?> GetByIdAsync(string id, ObjectId operatorId);

    /// <summary>
    /// Gets all badges in a specific series.
    /// </summary>
    /// <param name="seriesId">The series ID.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>List of badge DTOs in the series.</returns>
    Task<IEnumerable<BadgeDto>> GetBySeriesIdAsync(string seriesId, ObjectId operatorId);

    /// <summary>
    /// Gets all active badges for the current operator.
    /// </summary>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>List of active badge DTOs.</returns>
    Task<IEnumerable<BadgeDto>> GetActiveAsync(ObjectId operatorId);

    /// <summary>
    /// Creates a new badge.
    /// </summary>
    /// <param name="command">The create badge command.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <param name="userId">The creating user's ID.</param>
    /// <returns>The created badge DTO.</returns>
    Task<BadgeDto> CreateAsync(CreateBadgeCommand command, ObjectId operatorId, ObjectId? userId = null);

    /// <summary>
    /// Updates an existing badge.
    /// </summary>
    /// <param name="id">The badge ID to update.</param>
    /// <param name="command">The update badge command.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>The updated badge DTO if found, null otherwise.</returns>
    Task<BadgeDto?> UpdateAsync(string id, UpdateBadgeCommand command, ObjectId operatorId);

    /// <summary>
    /// Publishes (activates) a badge.
    /// </summary>
    /// <param name="id">The badge ID to publish.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>True if published, false if not found.</returns>
    Task<bool> PublishAsync(string id, ObjectId operatorId);

    /// <summary>
    /// Archives a badge.
    /// </summary>
    /// <param name="id">The badge ID to archive.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>True if archived, false if not found.</returns>
    Task<bool> ArchiveAsync(string id, ObjectId operatorId);

    /// <summary>
    /// Deletes a badge.
    /// </summary>
    /// <param name="id">The badge ID to delete.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeleteAsync(string id, ObjectId operatorId);
}
