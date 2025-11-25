using MongoDB.Bson;
using Smartico.BackOffice.Application.Missions.Commands;
using Smartico.BackOffice.Application.Missions.DTOs;

namespace Smartico.BackOffice.Application.Missions.Interfaces;

/// <summary>
/// Service interface for mission business logic operations.
/// </summary>
public interface IMissionService
{
    /// <summary>
    /// Creates a new mission for the specified operator.
    /// </summary>
    /// <param name="operatorId">The operator ID creating the mission.</param>
    /// <param name="command">The mission creation command.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created mission as a DTO.</returns>
    Task<MissionDto> CreateMissionAsync(
        ObjectId operatorId,
        CreateMissionCommand command,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a mission by its ID for the specified operator.
    /// </summary>
    /// <param name="operatorId">The operator ID requesting the mission.</param>
    /// <param name="missionId">The mission ID to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The mission DTO if found; otherwise, null.</returns>
    Task<MissionDto?> GetMissionByIdAsync(
        ObjectId operatorId,
        ObjectId missionId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all missions for the specified operator.
    /// </summary>
    /// <param name="operatorId">The operator ID requesting missions.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of mission DTOs.</returns>
    Task<List<MissionDto>> GetAllMissionsAsync(
        ObjectId operatorId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing mission.
    /// </summary>
    /// <param name="operatorId">The operator ID updating the mission.</param>
    /// <param name="missionId">The mission ID to update.</param>
    /// <param name="command">The updated mission data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated mission DTO.</returns>
    Task<MissionDto> UpdateMissionAsync(
        ObjectId operatorId,
        ObjectId missionId,
        CreateMissionCommand command,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a mission.
    /// </summary>
    /// <param name="operatorId">The operator ID deleting the mission.</param>
    /// <param name="missionId">The mission ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteMissionAsync(
        ObjectId operatorId,
        ObjectId missionId,
        CancellationToken cancellationToken = default);
}
