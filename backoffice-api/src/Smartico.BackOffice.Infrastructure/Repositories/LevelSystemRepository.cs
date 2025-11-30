using MongoDB.Bson;
using MongoDB.Driver;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;

namespace Smartico.BackOffice.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of the level system repository.
/// Automatically filters all queries by OperatorId for multi-tenant data isolation.
/// </summary>
public class LevelSystemRepository : BaseRepository<LevelSystem>, ILevelSystemRepository
{
    /// <summary>
    /// Initializes a new instance of the <see cref="LevelSystemRepository"/> class.
    /// </summary>
    /// <param name="database">The MongoDB database instance.</param>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    public LevelSystemRepository(IMongoDatabase database, ObjectId operatorId)
        : base(database, operatorId, "levelSystems")
    {
    }

    /// <inheritdoc/>
    public async Task CreateAsync(LevelSystem levelSystem, CancellationToken cancellationToken = default)
    {
        levelSystem.OperatorId = OperatorId;
        levelSystem.CreatedAt = DateTime.UtcNow;
        levelSystem.UpdatedAt = DateTime.UtcNow;

        await Collection.InsertOneAsync(levelSystem, cancellationToken: cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<LevelSystem?> GetByIdAsync(ObjectId operatorId, ObjectId levelSystemId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<LevelSystem>.Filter.And(
            Builders<LevelSystem>.Filter.Eq(x => x.Id, levelSystemId),
            Builders<LevelSystem>.Filter.Eq(x => x.OperatorId, operatorId)
        );

        return await Collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<List<LevelSystem>> GetAllAsync(ObjectId operatorId, CancellationToken cancellationToken = default)
    {
        var filter = GetOperatorFilter();
        return await Collection
            .Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<LevelSystem?> GetActiveAsync(ObjectId operatorId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<LevelSystem>.Filter.And(
            Builders<LevelSystem>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<LevelSystem>.Filter.Eq(x => x.Status, LevelSystemStatus.Active)
        );

        return await Collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<List<LevelSystem>> GetByStatusAsync(ObjectId operatorId, LevelSystemStatus status, CancellationToken cancellationToken = default)
    {
        var filter = Builders<LevelSystem>.Filter.And(
            Builders<LevelSystem>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<LevelSystem>.Filter.Eq(x => x.Status, status)
        );

        return await Collection
            .Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task UpdateAsync(LevelSystem levelSystem, CancellationToken cancellationToken = default)
    {
        levelSystem.UpdatedAt = DateTime.UtcNow;

        var filter = Builders<LevelSystem>.Filter.And(
            Builders<LevelSystem>.Filter.Eq(x => x.Id, levelSystem.Id),
            Builders<LevelSystem>.Filter.Eq(x => x.OperatorId, OperatorId)
        );

        await Collection.ReplaceOneAsync(filter, levelSystem, cancellationToken: cancellationToken);
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(ObjectId operatorId, ObjectId levelSystemId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<LevelSystem>.Filter.And(
            Builders<LevelSystem>.Filter.Eq(x => x.Id, levelSystemId),
            Builders<LevelSystem>.Filter.Eq(x => x.OperatorId, operatorId)
        );

        await Collection.DeleteOneAsync(filter, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<bool> IsNameInUseAsync(ObjectId operatorId, string name, ObjectId? excludeId = null, CancellationToken cancellationToken = default)
    {
        var filterBuilder = Builders<LevelSystem>.Filter;
        var filter = filterBuilder.And(
            filterBuilder.Eq(x => x.OperatorId, operatorId),
            filterBuilder.Eq(x => x.Name, name)
        );

        if (excludeId.HasValue)
        {
            filter = filterBuilder.And(filter, filterBuilder.Ne(x => x.Id, excludeId.Value));
        }

        return await Collection.Find(filter).AnyAsync(cancellationToken);
    }
}
