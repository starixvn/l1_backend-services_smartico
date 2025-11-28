using MongoDB.Bson;
using MongoDB.Driver;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;

namespace Smartico.BackOffice.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of the bonus claim repository.
/// Tracks bonus claims for enforcing per-bonus and global operator limits.
/// </summary>
public class BonusClaimRepository : BaseRepository<BonusClaim>, IBonusClaimRepository
{
    /// <summary>
    /// Initializes a new instance of the <see cref="BonusClaimRepository"/> class.
    /// </summary>
    /// <param name="database">The MongoDB database instance.</param>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    public BonusClaimRepository(IMongoDatabase database, ObjectId operatorId)
        : base(database, operatorId, "bonusClaims")
    {
    }

    /// <inheritdoc/>
    public async Task<BonusClaim> CreateAsync(BonusClaim claim, CancellationToken cancellationToken = default)
    {
        claim.OperatorId = OperatorId;
        claim.ClaimedAt = DateTime.UtcNow;
        claim.UpdatedAt = DateTime.UtcNow;

        await Collection.InsertOneAsync(claim, cancellationToken: cancellationToken);
        return claim;
    }

    /// <inheritdoc/>
    public async Task<BonusClaim?> GetByIdAsync(ObjectId operatorId, ObjectId id, CancellationToken cancellationToken = default)
    {
        var filter = Builders<BonusClaim>.Filter.And(
            Builders<BonusClaim>.Filter.Eq(x => x.Id, id),
            Builders<BonusClaim>.Filter.Eq(x => x.OperatorId, operatorId)
        );

        return await Collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<BonusClaim>> GetByBonusIdAsync(ObjectId operatorId, ObjectId bonusId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<BonusClaim>.Filter.And(
            Builders<BonusClaim>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<BonusClaim>.Filter.Eq(x => x.BonusId, bonusId)
        );

        return await Collection
            .Find(filter)
            .SortByDescending(x => x.ClaimedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<BonusClaim>> GetByPlayerIdAsync(ObjectId operatorId, string playerId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<BonusClaim>.Filter.And(
            Builders<BonusClaim>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<BonusClaim>.Filter.Eq(x => x.PlayerId, playerId)
        );

        return await Collection
            .Find(filter)
            .SortByDescending(x => x.ClaimedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<int> GetTotalClaimCountAsync(ObjectId operatorId, ObjectId bonusId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<BonusClaim>.Filter.And(
            Builders<BonusClaim>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<BonusClaim>.Filter.Eq(x => x.BonusId, bonusId),
            Builders<BonusClaim>.Filter.In(x => x.Status, new[] { BonusClaimStatus.Pending, BonusClaimStatus.Issued })
        );

        return (int)await Collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<int> GetPlayerClaimCountAsync(ObjectId operatorId, ObjectId bonusId, string playerId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<BonusClaim>.Filter.And(
            Builders<BonusClaim>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<BonusClaim>.Filter.Eq(x => x.BonusId, bonusId),
            Builders<BonusClaim>.Filter.Eq(x => x.PlayerId, playerId),
            Builders<BonusClaim>.Filter.In(x => x.Status, new[] { BonusClaimStatus.Pending, BonusClaimStatus.Issued })
        );

        return (int)await Collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<int> GetPlayerClaimCountInRangeAsync(
        ObjectId operatorId,
        ObjectId bonusId,
        string playerId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        var filter = Builders<BonusClaim>.Filter.And(
            Builders<BonusClaim>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<BonusClaim>.Filter.Eq(x => x.BonusId, bonusId),
            Builders<BonusClaim>.Filter.Eq(x => x.PlayerId, playerId),
            Builders<BonusClaim>.Filter.Gte(x => x.ClaimedAt, startDate),
            Builders<BonusClaim>.Filter.Lt(x => x.ClaimedAt, endDate),
            Builders<BonusClaim>.Filter.In(x => x.Status, new[] { BonusClaimStatus.Pending, BonusClaimStatus.Issued })
        );

        return (int)await Collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<decimal> GetPlayerTotalClaimValueInRangeAsync(
        ObjectId operatorId,
        string playerId,
        string currency,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        var filter = Builders<BonusClaim>.Filter.And(
            Builders<BonusClaim>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<BonusClaim>.Filter.Eq(x => x.PlayerId, playerId),
            Builders<BonusClaim>.Filter.Eq(x => x.Currency, currency),
            Builders<BonusClaim>.Filter.Gte(x => x.ClaimedAt, startDate),
            Builders<BonusClaim>.Filter.Lt(x => x.ClaimedAt, endDate),
            Builders<BonusClaim>.Filter.In(x => x.Status, new[] { BonusClaimStatus.Pending, BonusClaimStatus.Issued })
        );

        var pipeline = Collection
            .Aggregate()
            .Match(filter)
            .Group(new BsonDocument
            {
                { "_id", BsonNull.Value },
                { "totalValue", new BsonDocument("$sum", "$claimValue") }
            });

        var result = await pipeline.FirstOrDefaultAsync(cancellationToken);
        if (result == null)
        {
            return 0;
        }

        return result["totalValue"].AsDecimal;
    }

    /// <inheritdoc/>
    public async Task<decimal> GetTotalClaimValueAsync(ObjectId operatorId, ObjectId bonusId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<BonusClaim>.Filter.And(
            Builders<BonusClaim>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<BonusClaim>.Filter.Eq(x => x.BonusId, bonusId),
            Builders<BonusClaim>.Filter.In(x => x.Status, new[] { BonusClaimStatus.Pending, BonusClaimStatus.Issued })
        );

        var pipeline = Collection
            .Aggregate()
            .Match(filter)
            .Group(new BsonDocument
            {
                { "_id", BsonNull.Value },
                { "totalValue", new BsonDocument("$sum", "$claimValue") }
            });

        var result = await pipeline.FirstOrDefaultAsync(cancellationToken);
        if (result == null)
        {
            return 0;
        }

        return result["totalValue"].AsDecimal;
    }

    /// <inheritdoc/>
    public async Task<BonusClaim?> UpdateStatusAsync(
        ObjectId operatorId,
        ObjectId id,
        BonusClaimStatus status,
        string? externalReferenceId = null,
        CancellationToken cancellationToken = default)
    {
        var filter = Builders<BonusClaim>.Filter.And(
            Builders<BonusClaim>.Filter.Eq(x => x.Id, id),
            Builders<BonusClaim>.Filter.Eq(x => x.OperatorId, operatorId)
        );

        var updateBuilder = Builders<BonusClaim>.Update
            .Set(x => x.Status, status)
            .Set(x => x.UpdatedAt, DateTime.UtcNow);

        if (externalReferenceId != null)
        {
            updateBuilder = updateBuilder.Set(x => x.ExternalReferenceId, externalReferenceId);
        }

        return await Collection.FindOneAndUpdateAsync(
            filter,
            updateBuilder,
            new FindOneAndUpdateOptions<BonusClaim> { ReturnDocument = ReturnDocument.After },
            cancellationToken);
    }
}
