using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Smartico.BackOffice.Domain.Entities;

/// <summary>
/// Represents a role with associated permissions.
/// Roles are scoped to operators and define what actions users can perform.
/// </summary>
public class Role : IOperatorScoped
{
    /// <summary>
    /// Unique identifier for the role.
    /// </summary>
    [BsonId]
    [BsonElement("_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    /// <summary>
    /// Operator (casino/game provider) that owns this role.
    /// Used for multi-tenant data isolation.
    /// </summary>
    [BsonElement("operatorId")]
    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId OperatorId { get; set; }

    /// <summary>
    /// Role name (e.g., "Administrator", "Campaign Manager", "Viewer").
    /// </summary>
    [BsonElement("name")]
    [BsonRequired]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional description of the role and its purpose.
    /// </summary>
    [BsonElement("description")]
    public string? Description { get; set; }

    /// <summary>
    /// List of permission codes granted to this role (e.g., "tournaments.view", "missions.create").
    /// Permission codes reference the Permission collection.
    /// </summary>
    [BsonElement("permissions")]
    [BsonRequired]
    public List<string> Permissions { get; set; } = new();

    /// <summary>
    /// Indicates if this is a system-defined role that cannot be deleted.
    /// System roles: Administrator, Campaign Manager, Viewer.
    /// </summary>
    [BsonElement("isSystem")]
    public bool IsSystem { get; set; } = false;

    /// <summary>
    /// Timestamp when the role was created (UTC).
    /// </summary>
    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when the role was last updated (UTC).
    /// </summary>
    [BsonElement("updatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
