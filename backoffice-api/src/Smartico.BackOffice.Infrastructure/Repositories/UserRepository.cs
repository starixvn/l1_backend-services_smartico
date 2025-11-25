using MongoDB.Bson;
using MongoDB.Driver;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;

namespace Smartico.BackOffice.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of IUserRepository with operator-level data isolation.
/// Inherits from BaseRepository for automatic OperatorId filtering.
/// </summary>
public class UserRepository : BaseRepository<User>, IUserRepository
{
    /// <summary>
    /// Initializes a new instance of the UserRepository.
    /// </summary>
    /// <param name="database">MongoDB database instance.</param>
    /// <param name="operatorId">Operator ID for multi-tenant isolation.</param>
    public UserRepository(IMongoDatabase database, ObjectId operatorId)
        : base(database, operatorId, "users")
    {
    }

    /// <inheritdoc />
    public async Task CreateAsync(User user, CancellationToken cancellationToken = default)
    {
        user.OperatorId = OperatorId;
        user.CreatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        await Collection.InsertOneAsync(user, cancellationToken: cancellationToken);
    }

    /// <inheritdoc />
    public async Task<User?> GetByIdAsync(ObjectId operatorId, ObjectId userId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<User>.Filter.And(
            Builders<User>.Filter.Eq(u => u.Id, userId),
            Builders<User>.Filter.Eq(u => u.OperatorId, operatorId)
        );

        return await Collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<User?> GetByEmailAsync(ObjectId operatorId, string email, CancellationToken cancellationToken = default)
    {
        var filter = Builders<User>.Filter.And(
            Builders<User>.Filter.Eq(u => u.Email, email.ToLowerInvariant()),
            Builders<User>.Filter.Eq(u => u.OperatorId, operatorId)
        );

        return await Collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<List<User>> GetAllAsync(ObjectId operatorId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<User>.Filter.Eq(u => u.OperatorId, operatorId);
        var sort = Builders<User>.Sort.Descending(u => u.CreatedAt);

        return await Collection.Find(filter)
            .Sort(sort)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        user.UpdatedAt = DateTime.UtcNow;

        var filter = Builders<User>.Filter.And(
            Builders<User>.Filter.Eq(u => u.Id, user.Id),
            Builders<User>.Filter.Eq(u => u.OperatorId, user.OperatorId)
        );

        await Collection.ReplaceOneAsync(filter, user, cancellationToken: cancellationToken);
    }

    /// <inheritdoc />
    public async Task DeleteAsync(ObjectId operatorId, ObjectId userId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<User>.Filter.And(
            Builders<User>.Filter.Eq(u => u.Id, userId),
            Builders<User>.Filter.Eq(u => u.OperatorId, operatorId)
        );

        await Collection.DeleteOneAsync(filter, cancellationToken);
    }
}
