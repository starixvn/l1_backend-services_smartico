namespace Smartico.Missions.Infrastructure.Caching;

/// <summary>
/// Configuration options for caching service.
/// Bound from appsettings.json "Cache" section.
/// </summary>
public class CacheOptions
{
    /// <summary>
    /// Default TTL in seconds for cached entries
    /// </summary>
    public int DefaultTtlSeconds { get; set; } = 30;

    /// <summary>
    /// TTL for missions cache
    /// </summary>
    public int MissionsTtlSeconds { get; set; } = 30;

    /// <summary>
    /// TTL for badges cache
    /// </summary>
    public int BadgesTtlSeconds { get; set; } = 60;

    /// <summary>
    /// Maximum cache size in MB (for memory-based caching)
    /// </summary>
    public int MaxCacheSizeMb { get; set; } = 100;
}

