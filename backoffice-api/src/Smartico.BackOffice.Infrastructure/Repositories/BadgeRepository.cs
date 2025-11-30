using MongoDB.Bson;
using MongoDB.Driver;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;

namespace Smartico.BackOffice.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of the badge repository.
/// Automatically filters all queries by OperatorId for multi-tenant data isolation.
/// </summary>
public class BadgeRepository : BaseRepository<Badge>, IBadgeRepository
{
    /// <summary>
    /// Initializes a new instance of the <see cref="BadgeRepository"/> class.
    /// </summary>
    /// <param name="database">The MongoDB database instance.</param>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    public BadgeRepository(IMongoDatabase database, ObjectId operatorId)
        : base(database, operatorId, "badges")
    {
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<Badge>> GetAllAsync(ObjectId operatorId)
    {
        var filter = Builders<Badge>.Filter.Eq(x => x.OperatorId, operatorId);
        return await Collection
            .Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    /// <inheritdoc/>
    public async Task<Badge?> GetByIdAsync(ObjectId id, ObjectId operatorId)
    {
        var filter = Builders<Badge>.Filter.And(
            Builders<Badge>.Filter.Eq(x => x.Id, id),
            Builders<Badge>.Filter.Eq(x => x.OperatorId, operatorId)
        );

        return await Collection.Find(filter).FirstOrDefaultAsync();
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<Badge>> GetBySeriesIdAsync(ObjectId seriesId, ObjectId operatorId)
    {
        var filter = Builders<Badge>.Filter.And(
            Builders<Badge>.Filter.Eq(x => x.SeriesId, seriesId),
            Builders<Badge>.Filter.Eq(x => x.OperatorId, operatorId)
        );

        return await Collection
            .Find(filter)
            .SortBy(x => x.OrderInSeries)
            .ToListAsync();
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<Badge>> GetActiveAsync(ObjectId operatorId)
    {
        var filter = Builders<Badge>.Filter.And(
            Builders<Badge>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<Badge>.Filter.Eq(x => x.Status, BadgeStatus.Active)
        );

        return await Collection
            .Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    /// <inheritdoc/>
    public async Task<Badge> CreateAsync(Badge badge)
    {
        badge.OperatorId = OperatorId;
        badge.CreatedAt = DateTime.UtcNow;
        badge.UpdatedAt = DateTime.UtcNow;

        await Collection.InsertOneAsync(badge);
        return badge;
    }

    /// <inheritdoc/>
    public async Task<bool> UpdateAsync(Badge badge)
    {
        badge.UpdatedAt = DateTime.UtcNow;

        var filter = Builders<Badge>.Filter.And(
            Builders<Badge>.Filter.Eq(x => x.Id, badge.Id),
            Builders<Badge>.Filter.Eq(x => x.OperatorId, OperatorId)
        );

        var result = await Collection.ReplaceOneAsync(filter, badge);
        return result.ModifiedCount > 0;
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteAsync(ObjectId id, ObjectId operatorId)
    {
        var filter = Builders<Badge>.Filter.And(
            Builders<Badge>.Filter.Eq(x => x.Id, id),
            Builders<Badge>.Filter.Eq(x => x.OperatorId, operatorId)
        );

        var result = await Collection.DeleteOneAsync(filter);
        return result.DeletedCount > 0;
    }

    /// <inheritdoc/>
    public async Task<bool> IncrementUnlockCountAsync(ObjectId id, ObjectId operatorId)
    {
        var filter = Builders<Badge>.Filter.And(
            Builders<Badge>.Filter.Eq(x => x.Id, id),
            Builders<Badge>.Filter.Eq(x => x.OperatorId, operatorId)
        );

        var update = Builders<Badge>.Update
            .Inc(x => x.UnlockCount, 1)
            .Set(x => x.UpdatedAt, DateTime.UtcNow);

        var result = await Collection.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }
}
