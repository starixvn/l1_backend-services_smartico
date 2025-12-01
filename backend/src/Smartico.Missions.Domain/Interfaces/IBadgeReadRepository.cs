using MongoDB.Bson;
using BackOfficeBadge = Smartico.BackOffice.Domain.Entities.Badge;

namespace Smartico.Missions.Domain.Interfaces;

/// <summary>
/// Read-only repository for accessing badges from the shared MongoDB database.
/// Data is written by backoffice-api and read by this backend API.
/// </summary>
public interface IBadgeReadRepository
{
    /// <summary>
    /// Gets all active badges for a specific operator.
    /// Only returns badges with Status = Active.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of active badges.</returns>
    Task<List<BackOfficeBadge>> GetActiveBadgesAsync(ObjectId operatorId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a specific badge by ID for an operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="badgeId">The badge ID to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The badge if found, otherwise null.</returns>
    Task<BackOfficeBadge?> GetByIdAsync(ObjectId operatorId, ObjectId badgeId, CancellationToken cancellationToken = default);
}
