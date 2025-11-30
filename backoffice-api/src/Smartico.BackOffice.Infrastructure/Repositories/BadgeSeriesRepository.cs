using MongoDB.Bson;
using MongoDB.Driver;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;

namespace Smartico.BackOffice.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of the badge series repository.
/// Automatically filters all queries by OperatorId for multi-tenant data isolation.
/// </summary>
public class BadgeSeriesRepository : BaseRepository<BadgeSeries>, IBadgeSeriesRepository
{
    /// <summary>
    /// Initializes a new instance of the <see cref="BadgeSeriesRepository"/> class.
    /// </summary>
    /// <param name="database">The MongoDB database instance.</param>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    public BadgeSeriesRepository(IMongoDatabase database, ObjectId operatorId)
        : base(database, operatorId, "badgeSeries")
    {
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<BadgeSeries>> GetAllAsync(ObjectId operatorId)
    {
        var filter = Builders<BadgeSeries>.Filter.Eq(x => x.OperatorId, operatorId);
        return await Collection
            .Find(filter)
            .SortBy(x => x.DisplayOrder)
            .ToListAsync();
    }

    /// <inheritdoc/>
    public async Task<BadgeSeries?> GetByIdAsync(ObjectId id, ObjectId operatorId)
    {
        var filter = Builders<BadgeSeries>.Filter.And(
            Builders<BadgeSeries>.Filter.Eq(x => x.Id, id),
            Builders<BadgeSeries>.Filter.Eq(x => x.OperatorId, operatorId)
        );

        return await Collection.Find(filter).FirstOrDefaultAsync();
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<BadgeSeries>> GetActiveAsync(ObjectId operatorId)
    {
        var filter = Builders<BadgeSeries>.Filter.And(
            Builders<BadgeSeries>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<BadgeSeries>.Filter.Eq(x => x.Status, BadgeSeriesStatus.Active)
        );

        return await Collection
            .Find(filter)
            .SortBy(x => x.DisplayOrder)
            .ToListAsync();
    }

    /// <inheritdoc/>
    public async Task<BadgeSeries> CreateAsync(BadgeSeries series)
    {
        series.OperatorId = OperatorId;
        series.CreatedAt = DateTime.UtcNow;
        series.UpdatedAt = DateTime.UtcNow;

        await Collection.InsertOneAsync(series);
        return series;
    }

    /// <inheritdoc/>
    public async Task<bool> UpdateAsync(BadgeSeries series)
    {
        series.UpdatedAt = DateTime.UtcNow;

        var filter = Builders<BadgeSeries>.Filter.And(
            Builders<BadgeSeries>.Filter.Eq(x => x.Id, series.Id),
            Builders<BadgeSeries>.Filter.Eq(x => x.OperatorId, OperatorId)
        );

        var result = await Collection.ReplaceOneAsync(filter, series);
        return result.ModifiedCount > 0;
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteAsync(ObjectId id, ObjectId operatorId)
    {
        var filter = Builders<BadgeSeries>.Filter.And(
            Builders<BadgeSeries>.Filter.Eq(x => x.Id, id),
            Builders<BadgeSeries>.Filter.Eq(x => x.OperatorId, operatorId)
        );

        var result = await Collection.DeleteOneAsync(filter);
        return result.DeletedCount > 0;
    }
}
