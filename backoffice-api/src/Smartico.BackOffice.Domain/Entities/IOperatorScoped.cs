using MongoDB.Bson;

namespace Smartico.BackOffice.Domain.Entities;

/// <summary>
/// Interface for entities that are scoped to a specific operator.
/// This ensures multi-tenant data isolation at the application level.
/// All queries automatically filter by OperatorId to prevent cross-operator data access.
/// </summary>
/// <remarks>
/// Security Note: Every entity implementing this interface will have automatic
/// OperatorId filtering applied by the BaseRepository. This ensures that
/// Casino A cannot access Casino B's data under any circumstance.
/// </remarks>
public interface IOperatorScoped
{
    /// <summary>
    /// Gets or sets the unique identifier of the operator (casino/game provider)
    /// that owns this entity.
    /// </summary>
    /// <remarks>
    /// This field is critical for multi-tenant data isolation. It must be set
    /// on all entity creation operations and is automatically filtered in all queries.
    /// </remarks>
    ObjectId OperatorId { get; set; }
}
