using MongoDB.Bson;
using MongoDB.Driver;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;

namespace Smartico.BackOffice.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of the jackpot repository.
/// Automatically filters all queries by OperatorId for multi-tenant data isolation.
/// </summary>
public class JackpotRepository : BaseRepository<Jackpot>, IJackpotRepository
{
    /// <summary>
    /// Initializes a new instance of the <see cref="JackpotRepository"/> class.
    /// </summary>
    /// <param name="database">The MongoDB database instance.</param>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    public JackpotRepository(IMongoDatabase database, ObjectId operatorId)
        : base(database, operatorId, "jackpots")
    {
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<Jackpot>> GetAllAsync(ObjectId operatorId)
    {
        var filter = Builders<Jackpot>.Filter.Eq(x => x.OperatorId, operatorId);
        return await Collection
            .Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    /// <inheritdoc/>
    public async Task<Jackpot?> GetByIdAsync(ObjectId id, ObjectId operatorId)
    {
        var filter = Builders<Jackpot>.Filter.And(
            Builders<Jackpot>.Filter.Eq(x => x.Id, id),
            Builders<Jackpot>.Filter.Eq(x => x.OperatorId, operatorId)
        );

        return await Collection.Find(filter).FirstOrDefaultAsync();
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<Jackpot>> GetActiveAsync(ObjectId operatorId)
    {
        var filter = Builders<Jackpot>.Filter.And(
            Builders<Jackpot>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<Jackpot>.Filter.Eq(x => x.Status, JackpotStatus.Active)
        );

        return await Collection
            .Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<Jackpot>> GetByStatusAsync(JackpotStatus status, ObjectId operatorId)
    {
        var filter = Builders<Jackpot>.Filter.And(
            Builders<Jackpot>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<Jackpot>.Filter.Eq(x => x.Status, status)
        );

        return await Collection
            .Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    /// <inheritdoc/>
    public async Task<Jackpot> CreateAsync(Jackpot jackpot)
    {
        jackpot.OperatorId = OperatorId;
        jackpot.CreatedAt = DateTime.UtcNow;
        jackpot.UpdatedAt = DateTime.UtcNow;

        await Collection.InsertOneAsync(jackpot);
        return jackpot;
    }

    /// <inheritdoc/>
    public async Task<bool> UpdateAsync(Jackpot jackpot)
    {
        jackpot.UpdatedAt = DateTime.UtcNow;

        var filter = Builders<Jackpot>.Filter.And(
            Builders<Jackpot>.Filter.Eq(x => x.Id, jackpot.Id),
            Builders<Jackpot>.Filter.Eq(x => x.OperatorId, OperatorId)
        );

        var result = await Collection.ReplaceOneAsync(filter, jackpot);
        return result.ModifiedCount > 0;
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteAsync(ObjectId id, ObjectId operatorId)
    {
        var filter = Builders<Jackpot>.Filter.And(
            Builders<Jackpot>.Filter.Eq(x => x.Id, id),
            Builders<Jackpot>.Filter.Eq(x => x.OperatorId, operatorId)
        );

        var result = await Collection.DeleteOneAsync(filter);
        return result.DeletedCount > 0;
    }

    /// <inheritdoc/>
    public async Task<bool> UpdateTierValueAsync(ObjectId id, string tierId, decimal newValue, ObjectId operatorId)
    {
        var filter = Builders<Jackpot>.Filter.And(
            Builders<Jackpot>.Filter.Eq(x => x.Id, id),
            Builders<Jackpot>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<Jackpot>.Filter.ElemMatch(x => x.Tiers, t => t.TierId == tierId)
        );

        var update = Builders<Jackpot>.Update
            .Set("tiers.$.currentValue", newValue)
            .Set(x => x.UpdatedAt, DateTime.UtcNow);

        var result = await Collection.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    /// <inheritdoc/>
    public async Task<bool> RecordWinAsync(ObjectId id, string tierId, string winnerId, decimal winAmount, ObjectId operatorId)
    {
        // First get the jackpot to determine reset behavior and seed amount
        var jackpot = await GetByIdAsync(id, operatorId);
        if (jackpot == null) return false;

        var tier = jackpot.Tiers.FirstOrDefault(t => t.TierId == tierId);
        if (tier == null) return false;

        // Calculate new tier value based on reset behavior
        decimal newTierValue = jackpot.ResetBehavior switch
        {
            JackpotResetBehavior.ResetToSeed => tier.SeedAmount,
            JackpotResetBehavior.ResetToZero => 0,
            JackpotResetBehavior.KeepRemainder => tier.CurrentValue - winAmount,
            _ => tier.SeedAmount
        };

        var filter = Builders<Jackpot>.Filter.And(
            Builders<Jackpot>.Filter.Eq(x => x.Id, id),
            Builders<Jackpot>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<Jackpot>.Filter.ElemMatch(x => x.Tiers, t => t.TierId == tierId)
        );

        var update = Builders<Jackpot>.Update
            .Set("tiers.$.currentValue", newTierValue)
            .Set(x => x.LastWonAt, DateTime.UtcNow)
            .Set(x => x.LastWinnerPlayerId, winnerId)
            .Set(x => x.LastWinAmount, winAmount)
            .Inc(x => x.TotalPayouts, winAmount)
            .Set(x => x.UpdatedAt, DateTime.UtcNow);

        var result = await Collection.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }
}
