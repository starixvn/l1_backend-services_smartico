using MongoDB.Bson;
using MongoDB.Driver;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;

namespace Smartico.BackOffice.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of the leaderboard repository.
/// </summary>
public class LeaderboardRepository : BaseRepository<LeaderboardEntry>, ILeaderboardRepository
{
    /// <summary>
    /// Initializes a new instance of the <see cref="LeaderboardRepository"/> class.
    /// </summary>
    /// <param name="database">The MongoDB database.</param>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    public LeaderboardRepository(IMongoDatabase database, ObjectId operatorId)
        : base(database, operatorId, "leaderboardEntries")
    {
    }

    /// <inheritdoc/>
    public async Task<List<LeaderboardEntry>> GetLeaderboardAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        int limit = 100,
        CancellationToken cancellationToken = default)
    {
        var filter = Builders<LeaderboardEntry>.Filter.And(
            Builders<LeaderboardEntry>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<LeaderboardEntry>.Filter.Eq(x => x.TournamentId, tournamentId)
        );

        var sort = Builders<LeaderboardEntry>.Sort.Ascending(x => x.Rank);

        return await Collection
            .Find(filter)
            .Sort(sort)
            .Limit(limit)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<LeaderboardEntry?> GetPlayerEntryAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        string playerId,
        CancellationToken cancellationToken = default)
    {
        var filter = Builders<LeaderboardEntry>.Filter.And(
            Builders<LeaderboardEntry>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<LeaderboardEntry>.Filter.Eq(x => x.TournamentId, tournamentId),
            Builders<LeaderboardEntry>.Filter.Eq(x => x.PlayerId, playerId)
        );

        return await Collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<LeaderboardEntry> UpsertEntryAsync(
        LeaderboardEntry entry,
        CancellationToken cancellationToken = default)
    {
        var filter = Builders<LeaderboardEntry>.Filter.And(
            Builders<LeaderboardEntry>.Filter.Eq(x => x.OperatorId, entry.OperatorId),
            Builders<LeaderboardEntry>.Filter.Eq(x => x.TournamentId, entry.TournamentId),
            Builders<LeaderboardEntry>.Filter.Eq(x => x.PlayerId, entry.PlayerId)
        );

        entry.LastUpdated = DateTime.UtcNow;

        var options = new FindOneAndReplaceOptions<LeaderboardEntry>
        {
            IsUpsert = true,
            ReturnDocument = ReturnDocument.After
        };

        return await Collection.FindOneAndReplaceAsync(filter, entry, options, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<int> RecalculateRanksAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        CancellationToken cancellationToken = default)
    {
        var filter = Builders<LeaderboardEntry>.Filter.And(
            Builders<LeaderboardEntry>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<LeaderboardEntry>.Filter.Eq(x => x.TournamentId, tournamentId)
        );

        // Get all entries sorted by score descending
        var entries = await Collection
            .Find(filter)
            .Sort(Builders<LeaderboardEntry>.Sort.Descending(x => x.Score))
            .ToListAsync(cancellationToken);

        // Update ranks
        var bulkOps = new List<WriteModel<LeaderboardEntry>>();
        for (int i = 0; i < entries.Count; i++)
        {
            var entry = entries[i];
            var newRank = i + 1;

            if (entry.Rank != newRank)
            {
                var updateFilter = Builders<LeaderboardEntry>.Filter.Eq(x => x.Id, entry.Id);
                var update = Builders<LeaderboardEntry>.Update
                    .Set(x => x.Rank, newRank)
                    .Set(x => x.LastUpdated, DateTime.UtcNow);

                bulkOps.Add(new UpdateOneModel<LeaderboardEntry>(updateFilter, update));
            }
        }

        if (bulkOps.Count > 0)
        {
            await Collection.BulkWriteAsync(bulkOps, cancellationToken: cancellationToken);
        }

        return bulkOps.Count;
    }

    /// <inheritdoc/>
    public async Task<long> DeleteTournamentLeaderboardAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        CancellationToken cancellationToken = default)
    {
        var filter = Builders<LeaderboardEntry>.Filter.And(
            Builders<LeaderboardEntry>.Filter.Eq(x => x.OperatorId, operatorId),
            Builders<LeaderboardEntry>.Filter.Eq(x => x.TournamentId, tournamentId)
        );

        var result = await Collection.DeleteManyAsync(filter, cancellationToken);
        return result.DeletedCount;
    }
}
