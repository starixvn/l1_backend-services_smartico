using MongoDB.Bson;
using MongoDB.Driver;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;

namespace Smartico.BackOffice.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of IMissionRepository with operator-level data isolation.
/// Inherits from BaseRepository for automatic OperatorId filtering.
/// </summary>
public class MissionRepository : BaseRepository<Mission>, IMissionRepository
{
    /// <summary>
    /// Initializes a new instance of the MissionRepository.
    /// </summary>
    /// <param name="database">MongoDB database instance.</param>
    /// <param name="operatorId">Operator ID for multi-tenant isolation.</param>
    public MissionRepository(IMongoDatabase database, ObjectId operatorId)
        : base(database, operatorId, "missions")
    {
    }

    /// <inheritdoc />
    public async Task CreateAsync(Mission mission, CancellationToken cancellationToken = default)
    {
        mission.OperatorId = OperatorId;
        mission.CreatedAt = DateTime.UtcNow;
        mission.UpdatedAt = DateTime.UtcNow;

        await Collection.InsertOneAsync(mission, cancellationToken: cancellationToken);
    }

    /// <inheritdoc />
    public async Task<Mission?> GetByIdAsync(ObjectId operatorId, ObjectId missionId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Mission>.Filter.And(
            Builders<Mission>.Filter.Eq(m => m.Id, missionId),
            Builders<Mission>.Filter.Eq(m => m.OperatorId, operatorId)
        );

        return await Collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<List<Mission>> GetAllAsync(ObjectId operatorId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Mission>.Filter.Eq(m => m.OperatorId, operatorId);
        var sort = Builders<Mission>.Sort.Descending(m => m.CreatedAt);

        return await Collection.Find(filter)
            .Sort(sort)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task UpdateAsync(Mission mission, CancellationToken cancellationToken = default)
    {
        mission.UpdatedAt = DateTime.UtcNow;

        var filter = Builders<Mission>.Filter.And(
            Builders<Mission>.Filter.Eq(m => m.Id, mission.Id),
            Builders<Mission>.Filter.Eq(m => m.OperatorId, mission.OperatorId)
        );

        await Collection.ReplaceOneAsync(filter, mission, cancellationToken: cancellationToken);
    }

    /// <inheritdoc />
    public async Task DeleteAsync(ObjectId operatorId, ObjectId missionId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Mission>.Filter.And(
            Builders<Mission>.Filter.Eq(m => m.Id, missionId),
            Builders<Mission>.Filter.Eq(m => m.OperatorId, operatorId)
        );

        await Collection.DeleteOneAsync(filter, cancellationToken);
    }
}
