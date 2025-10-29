namespace Smartico.Missions.Infrastructure.Storage.Models;

/// <summary>
/// Storage model for audit logs.
/// </summary>
public class AuditLogData
{
    /// <summary>
    /// List of audit log entries
    /// </summary>
    public List<AuditLogEntry> Logs { get; set; } = new();
}

/// <summary>
/// Individual audit log entry.
/// </summary>
public class AuditLogEntry
{
    /// <summary>
    /// Timestamp of the action
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// User ID who performed the action
    /// </summary>
    public required string UserId { get; set; }

    /// <summary>
    /// Action performed (e.g., "opt_in", "claim_reward")
    /// </summary>
    public required string Action { get; set; }

    /// <summary>
    /// Resource affected (e.g., "mission:123")
    /// </summary>
    public string? Resource { get; set; }

    /// <summary>
    /// Was the action successful?
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Error message (if failed)
    /// </summary>
    public string? ErrorMessage { get; set; }
}

