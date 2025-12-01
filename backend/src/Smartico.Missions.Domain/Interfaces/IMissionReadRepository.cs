using MongoDB.Bson;
using BackOfficeMission = Smartico.BackOffice.Domain.Entities.Mission;

namespace Smartico.Missions.Domain.Interfaces;

/// <summary>
/// Read-only repository for accessing missions from the shared MongoDB database.
/// Data is written by backoffice-api and read by this backend API.
/// </summary>
public interface IMissionReadRepository
{
    /// <summary>
    /// Gets all active missions for a specific operator.
    /// Only returns missions with Status = Active.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of active missions.</returns>
    Task<List<BackOfficeMission>> GetActiveMissionsAsync(ObjectId operatorId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a specific mission by ID for an operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="missionId">The mission ID to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The mission if found, otherwise null.</returns>
    Task<BackOfficeMission?> GetByIdAsync(ObjectId operatorId, ObjectId missionId, CancellationToken cancellationToken = default);
}
