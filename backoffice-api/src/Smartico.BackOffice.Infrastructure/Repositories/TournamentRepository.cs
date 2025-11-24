using MongoDB.Bson;
using MongoDB.Driver;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;

namespace Smartico.BackOffice.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of the tournament repository.
/// Automatically filters all queries by OperatorId for multi-tenant data isolation.
/// </summary>
public class TournamentRepository : BaseRepository<Tournament>, ITournamentRepository
{
    /// <summary>
    /// Initializes a new instance of the <see cref="TournamentRepository"/> class.
    /// </summary>
    /// <param name="database">The MongoDB database instance.</param>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    public TournamentRepository(IMongoDatabase database, ObjectId operatorId)
        : base(database, operatorId, "tournaments")
    {
    }

    /// <inheritdoc/>
    public async Task CreateAsync(Tournament tournament, CancellationToken cancellationToken = default)
    {
        tournament.OperatorId = OperatorId;
        tournament.CreatedAt = DateTime.UtcNow;
        tournament.UpdatedAt = DateTime.UtcNow;

        await Collection.InsertOneAsync(tournament, cancellationToken: cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<Tournament?> GetByIdAsync(ObjectId operatorId, ObjectId tournamentId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Tournament>.Filter.And(
            Builders<Tournament>.Filter.Eq(x => x.Id, tournamentId),
            Builders<Tournament>.Filter.Eq(x => x.OperatorId, operatorId)
        );

        return await Collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<List<Tournament>> GetAllAsync(ObjectId operatorId, CancellationToken cancellationToken = default)
    {
        var filter = GetOperatorFilter();
        return await Collection
            .Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task UpdateAsync(Tournament tournament, CancellationToken cancellationToken = default)
    {
        tournament.UpdatedAt = DateTime.UtcNow;

        var filter = Builders<Tournament>.Filter.And(
            Builders<Tournament>.Filter.Eq(x => x.Id, tournament.Id),
            Builders<Tournament>.Filter.Eq(x => x.OperatorId, OperatorId)
        );

        await Collection.ReplaceOneAsync(filter, tournament, cancellationToken: cancellationToken);
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(ObjectId operatorId, ObjectId tournamentId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Tournament>.Filter.And(
            Builders<Tournament>.Filter.Eq(x => x.Id, tournamentId),
            Builders<Tournament>.Filter.Eq(x => x.OperatorId, operatorId)
        );

        await Collection.DeleteOneAsync(filter, cancellationToken);
    }
}
