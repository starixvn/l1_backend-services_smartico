using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using Smartico.Missions.Domain.Interfaces;
using BackOfficeMission = Smartico.BackOffice.Domain.Entities.Mission;
using BackOfficeMissionStatus = Smartico.BackOffice.Domain.ValueObjects.MissionStatus;

namespace Smartico.Missions.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of IMissionReadRepository.
/// Reads missions from the shared backoffice database.
/// </summary>
public class MissionReadRepository : IMissionReadRepository
{
    private readonly IMongoCollection<BackOfficeMission> _collection;
    private readonly ILogger<MissionReadRepository> _logger;
    private const string CollectionName = "missions";

    public MissionReadRepository(
        IMongoDatabase database,
        ILogger<MissionReadRepository> logger)
    {
        _collection = database.GetCollection<BackOfficeMission>(CollectionName);
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<List<BackOfficeMission>> GetActiveMissionsAsync(
        ObjectId operatorId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogDebug(
            "Fetching active missions for operator {OperatorId}",
            operatorId);

        var filter = Builders<BackOfficeMission>.Filter.And(
            Builders<BackOfficeMission>.Filter.Eq(m => m.OperatorId, operatorId),
            Builders<BackOfficeMission>.Filter.Eq(m => m.Status, BackOfficeMissionStatus.Active)
        );

        var missions = await _collection
            .Find(filter)
            .SortByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);

        _logger.LogInformation(
            "Found {Count} active missions for operator {OperatorId}",
            missions.Count,
            operatorId);

        return missions;
    }

    /// <inheritdoc />
    public async Task<BackOfficeMission?> GetByIdAsync(
        ObjectId operatorId,
        ObjectId missionId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogDebug(
            "Fetching mission {MissionId} for operator {OperatorId}",
            missionId,
            operatorId);

        var filter = Builders<BackOfficeMission>.Filter.And(
            Builders<BackOfficeMission>.Filter.Eq(m => m.OperatorId, operatorId),
            Builders<BackOfficeMission>.Filter.Eq(m => m.Id, missionId)
        );

        var mission = await _collection
            .Find(filter)
            .FirstOrDefaultAsync(cancellationToken);

        if (mission == null)
        {
            _logger.LogWarning(
                "Mission {MissionId} not found for operator {OperatorId}",
                missionId,
                operatorId);
        }

        return mission;
    }
}
