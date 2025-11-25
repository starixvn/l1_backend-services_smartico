using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Smartico.BackOffice.Domain.Entities;

/// <summary>
/// Represents a back office user with authentication and role-based access.
/// Users are scoped to operators and have one or more assigned roles.
/// </summary>
public class User : IOperatorScoped
{
    /// <summary>
    /// Unique identifier for the user.
    /// </summary>
    [BsonId]
    [BsonElement("_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    /// <summary>
    /// Operator (casino/game provider) that owns this user.
    /// Used for multi-tenant data isolation.
    /// </summary>
    [BsonElement("operatorId")]
    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId OperatorId { get; set; }

    /// <summary>
    /// User's email address (used for login).
    /// Must be unique within the operator.
    /// </summary>
    [BsonElement("email")]
    [BsonRequired]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User's full name.
    /// </summary>
    [BsonElement("fullName")]
    [BsonRequired]
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Hashed password (using BCrypt or similar).
    /// </summary>
    [BsonElement("passwordHash")]
    [BsonRequired]
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// List of role IDs assigned to this user.
    /// </summary>
    [BsonElement("roleIds")]
    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    public List<ObjectId> RoleIds { get; set; } = new();

    /// <summary>
    /// Indicates if the user account is active.
    /// Inactive users cannot log in.
    /// </summary>
    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Timestamp of the user's last login (UTC).
    /// </summary>
    [BsonElement("lastLoginAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime? LastLoginAt { get; set; }

    /// <summary>
    /// Timestamp when the user was created (UTC).
    /// </summary>
    [BsonElement("createdAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when the user was last updated (UTC).
    /// </summary>
    [BsonElement("updatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
