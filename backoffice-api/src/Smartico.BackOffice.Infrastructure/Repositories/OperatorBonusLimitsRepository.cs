using MongoDB.Bson;
using MongoDB.Driver;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;

namespace Smartico.BackOffice.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of the operator bonus limits repository.
/// Manages global bonus limits for operators.
/// </summary>
public class OperatorBonusLimitsRepository : BaseRepository<OperatorBonusLimits>, IOperatorBonusLimitsRepository
{
    /// <summary>
    /// Initializes a new instance of the <see cref="OperatorBonusLimitsRepository"/> class.
    /// </summary>
    /// <param name="database">The MongoDB database instance.</param>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    public OperatorBonusLimitsRepository(IMongoDatabase database, ObjectId operatorId)
        : base(database, operatorId, "operatorBonusLimits")
    {
    }

    /// <inheritdoc/>
    public async Task<OperatorBonusLimits?> GetByOperatorIdAsync(ObjectId operatorId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<OperatorBonusLimits>.Filter.Eq(x => x.OperatorId, operatorId);
        return await Collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<OperatorBonusLimits> UpsertAsync(OperatorBonusLimits limits, CancellationToken cancellationToken = default)
    {
        limits.OperatorId = OperatorId;
        limits.UpdatedAt = DateTime.UtcNow;

        var filter = Builders<OperatorBonusLimits>.Filter.Eq(x => x.OperatorId, OperatorId);
        var options = new ReplaceOptions { IsUpsert = true };

        var existingLimits = await Collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
        if (existingLimits == null)
        {
            limits.CreatedAt = DateTime.UtcNow;
        }
        else
        {
            limits.Id = existingLimits.Id;
            limits.CreatedAt = existingLimits.CreatedAt;
        }

        await Collection.ReplaceOneAsync(filter, limits, options, cancellationToken);
        return limits;
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteAsync(ObjectId operatorId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<OperatorBonusLimits>.Filter.Eq(x => x.OperatorId, operatorId);
        var result = await Collection.DeleteOneAsync(filter, cancellationToken);
        return result.DeletedCount > 0;
    }
}
