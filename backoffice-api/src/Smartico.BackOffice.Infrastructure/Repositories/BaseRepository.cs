using MongoDB.Bson;
using MongoDB.Driver;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Infrastructure.Repositories;

/// <summary>
/// Base repository providing automatic OperatorId filtering for multi-tenant data isolation.
/// All queries automatically include an OperatorId filter to ensure data security.
/// </summary>
/// <typeparam name="T">The entity type that implements IOperatorScoped.</typeparam>
/// <remarks>
/// Security Critical: This class enforces application-level multi-tenancy.
/// Every query is automatically filtered by OperatorId to prevent cross-operator data access.
/// </remarks>
public abstract class BaseRepository<T> where T : IOperatorScoped
{
    /// <summary>
    /// Gets the MongoDB collection for the entity type.
    /// </summary>
    protected IMongoCollection<T> Collection { get; }

    /// <summary>
    /// Gets the operator ID used for filtering all queries.
    /// </summary>
    protected ObjectId OperatorId { get; }

    /// <summary>
    /// Initializes a new instance of the <see cref="BaseRepository{T}"/> class.
    /// </summary>
    /// <param name="database">The MongoDB database instance.</param>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="collectionName">The name of the MongoDB collection.</param>
    protected BaseRepository(IMongoDatabase database, ObjectId operatorId, string collectionName)
    {
        Collection = database.GetCollection<T>(collectionName);
        OperatorId = operatorId;
    }

    /// <summary>
    /// Adds an OperatorId filter to an existing filter definition.
    /// This ensures all queries are automatically scoped to the current operator.
    /// </summary>
    /// <param name="filter">The existing filter to combine with OperatorId filter.</param>
    /// <returns>A combined filter that includes both the provided filter and OperatorId filtering.</returns>
    /// <remarks>
    /// Security Critical: This method is essential for multi-tenant data isolation.
    /// It ensures that even if a query filter is provided, the OperatorId constraint is always applied.
    /// </remarks>
    protected FilterDefinition<T> AddOperatorFilter(FilterDefinition<T> filter)
    {
        var operatorFilter = Builders<T>.Filter.Eq(x => x.OperatorId, OperatorId);
        return Builders<T>.Filter.And(filter, operatorFilter);
    }

    /// <summary>
    /// Creates a filter definition that only matches the current operator.
    /// </summary>
    /// <returns>A filter definition for the current OperatorId.</returns>
    protected FilterDefinition<T> GetOperatorFilter()
    {
        return Builders<T>.Filter.Eq(x => x.OperatorId, OperatorId);
    }
}
