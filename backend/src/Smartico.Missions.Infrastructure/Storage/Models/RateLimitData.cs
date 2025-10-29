namespace Smartico.Missions.Infrastructure.Storage.Models;

/// <summary>
/// Storage model for rate limit tracking.
/// </summary>
public class RateLimitData
{
    /// <summary>
    /// Rate limit entries by user ID
    /// </summary>
    public Dictionary<string, RateLimitEntry> Limits { get; set; } = new();
}

/// <summary>
/// Rate limit entry for a specific user.
/// </summary>
public class RateLimitEntry
{
    /// <summary>
    /// Request count within current window
    /// </summary>
    public int Count { get; set; }

    /// <summary>
    /// When the rate limit window resets
    /// </summary>
    public DateTime ResetAt { get; set; }

    /// <summary>
    /// Last request timestamp
    /// </summary>
    public DateTime LastRequestAt { get; set; } = DateTime.UtcNow;
}

