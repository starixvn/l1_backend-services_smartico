using MongoDB.Bson;
using MongoDB.Driver;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;

namespace Smartico.BackOffice.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of the bonus repository.
/// Automatically filters all queries by OperatorId for multi-tenant data isolation.
/// </summary>
public class BonusRepository : BaseRepository<Bonus>, IBonusRepository
{
    /// <summary>
    /// Initializes a new instance of the <see cref="BonusRepository"/> class.
    /// </summary>
    /// <param name="database">The MongoDB database instance.</param>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    public BonusRepository(IMongoDatabase database, ObjectId operatorId)
        : base(database, operatorId, "bonuses")
    {
    }

    /// <inheritdoc/>
    public async Task CreateAsync(Bonus bonus, CancellationToken cancellationToken = default)
    {
        bonus.OperatorId = OperatorId;
        bonus.CreatedAt = DateTime.UtcNow;
        bonus.UpdatedAt = DateTime.UtcNow;

        await Collection.InsertOneAsync(bonus, cancellationToken: cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<Bonus?> GetByIdAsync(ObjectId operatorId, ObjectId bonusId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Bonus>.Filter.And(
            Builders<Bonus>.Filter.Eq(x => x.Id, bonusId),
            Builders<Bonus>.Filter.Eq(x => x.OperatorId, operatorId)
        );

        return await Collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<List<Bonus>> GetAllAsync(ObjectId operatorId, CancellationToken cancellationToken = default)
    {
        var filter = GetOperatorFilter();
        return await Collection
            .Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<List<Bonus>> GetByStatusAsync(ObjectId operatorId, BonusStatus status, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Bonus>.Filter.And(
            Builders<Bonus>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<Bonus>.Filter.Eq(x => x.Status, status)
        );

        return await Collection
            .Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<Bonus?> GetByGiftCodeAsync(ObjectId operatorId, string giftCode, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Bonus>.Filter.And(
            Builders<Bonus>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<Bonus>.Filter.Eq(x => x.GiftCode, giftCode)
        );

        return await Collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task UpdateAsync(Bonus bonus, CancellationToken cancellationToken = default)
    {
        bonus.UpdatedAt = DateTime.UtcNow;

        var filter = Builders<Bonus>.Filter.And(
            Builders<Bonus>.Filter.Eq(x => x.Id, bonus.Id),
            Builders<Bonus>.Filter.Eq(x => x.OperatorId, OperatorId)
        );

        await Collection.ReplaceOneAsync(filter, bonus, cancellationToken: cancellationToken);
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(ObjectId operatorId, ObjectId bonusId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Bonus>.Filter.And(
            Builders<Bonus>.Filter.Eq(x => x.Id, bonusId),
            Builders<Bonus>.Filter.Eq(x => x.OperatorId, operatorId)
        );

        await Collection.DeleteOneAsync(filter, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<bool> IsGiftCodeInUseAsync(ObjectId operatorId, string giftCode, ObjectId? excludeBonusId = null, CancellationToken cancellationToken = default)
    {
        var filterBuilder = Builders<Bonus>.Filter;
        var filter = filterBuilder.And(
            filterBuilder.Eq(x => x.OperatorId, operatorId),
            filterBuilder.Eq(x => x.GiftCode, giftCode)
        );

        if (excludeBonusId.HasValue)
        {
            filter = filterBuilder.And(filter, filterBuilder.Ne(x => x.Id, excludeBonusId.Value));
        }

        return await Collection.Find(filter).AnyAsync(cancellationToken);
    }
}
