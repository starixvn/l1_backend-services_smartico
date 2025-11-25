using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Smartico.BackOffice.Domain.Entities;

/// <summary>
/// Represents a permission in the system.
/// Permissions are grouped by module/feature area for better organization.
/// </summary>
public class Permission
{
    [BsonId]
    [BsonElement("_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    /// <summary>
    /// Unique permission code (e.g., "tournaments.view", "missions.create")
    /// </summary>
    [BsonElement("code")]
    [BsonRequired]
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Display name for the permission
    /// </summary>
    [BsonElement("name")]
    [BsonRequired]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Description of what this permission allows
    /// </summary>
    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Module/feature area this permission belongs to (e.g., "Tournaments", "Missions", "Users")
    /// </summary>
    [BsonElement("module")]
    [BsonRequired]
    public string Module { get; set; } = string.Empty;

    /// <summary>
    /// Whether this is a system permission (cannot be deleted)
    /// </summary>
    [BsonElement("isSystem")]
    public bool IsSystem { get; set; } = false;

    /// <summary>
    /// Display order within the module
    /// </summary>
    [BsonElement("displayOrder")]
    public int DisplayOrder { get; set; } = 0;

    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
