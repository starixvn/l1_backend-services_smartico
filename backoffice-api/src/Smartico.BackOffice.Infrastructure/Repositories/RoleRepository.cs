using MongoDB.Bson;
using MongoDB.Driver;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;

namespace Smartico.BackOffice.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of IRoleRepository with operator-level data isolation.
/// Inherits from BaseRepository for automatic OperatorId filtering.
/// </summary>
public class RoleRepository : BaseRepository<Role>, IRoleRepository
{
    /// <summary>
    /// Initializes a new instance of the RoleRepository.
    /// </summary>
    /// <param name="database">MongoDB database instance.</param>
    /// <param name="operatorId">Operator ID for multi-tenant isolation.</param>
    public RoleRepository(IMongoDatabase database, ObjectId operatorId)
        : base(database, operatorId, "roles")
    {
    }

    /// <inheritdoc />
    public async Task CreateAsync(Role role, CancellationToken cancellationToken = default)
    {
        role.OperatorId = OperatorId;
        role.CreatedAt = DateTime.UtcNow;
        role.UpdatedAt = DateTime.UtcNow;

        await Collection.InsertOneAsync(role, cancellationToken: cancellationToken);
    }

    /// <inheritdoc />
    public async Task<Role?> GetByIdAsync(ObjectId operatorId, ObjectId roleId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Role>.Filter.And(
            Builders<Role>.Filter.Eq(r => r.Id, roleId),
            Builders<Role>.Filter.Eq(r => r.OperatorId, operatorId)
        );

        return await Collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<List<Role>> GetByIdsAsync(ObjectId operatorId, List<ObjectId> roleIds, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Role>.Filter.And(
            Builders<Role>.Filter.In(r => r.Id, roleIds),
            Builders<Role>.Filter.Eq(r => r.OperatorId, operatorId)
        );

        return await Collection.Find(filter).ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<List<Role>> GetAllAsync(ObjectId operatorId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Role>.Filter.Eq(r => r.OperatorId, operatorId);
        var sort = Builders<Role>.Sort.Descending(r => r.CreatedAt);

        return await Collection.Find(filter)
            .Sort(sort)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task UpdateAsync(Role role, CancellationToken cancellationToken = default)
    {
        role.UpdatedAt = DateTime.UtcNow;

        var filter = Builders<Role>.Filter.And(
            Builders<Role>.Filter.Eq(r => r.Id, role.Id),
            Builders<Role>.Filter.Eq(r => r.OperatorId, role.OperatorId)
        );

        await Collection.ReplaceOneAsync(filter, role, cancellationToken: cancellationToken);
    }

    /// <inheritdoc />
    public async Task DeleteAsync(ObjectId operatorId, ObjectId roleId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Role>.Filter.And(
            Builders<Role>.Filter.Eq(r => r.Id, roleId),
            Builders<Role>.Filter.Eq(r => r.OperatorId, operatorId)
        );

        await Collection.DeleteOneAsync(filter, cancellationToken);
    }
}
