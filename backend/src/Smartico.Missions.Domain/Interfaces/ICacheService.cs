namespace Smartico.Missions.Domain.Interfaces;

/// <summary>
/// Interface for caching service with TTL support.
/// Provides methods for storing and retrieving cached data.
/// </summary>
public interface ICacheService
{
    /// <summary>
    /// Gets a cached value by key.
    /// </summary>
    /// <typeparam name="T">Type of the cached value</typeparam>
    /// <param name="key">Cache key</param>
    /// <returns>Cached value or null if not found or expired</returns>
    Task<T?> GetAsync<T>(string key) where T : class;

    /// <summary>
    /// Sets a value in the cache with the default TTL.
    /// </summary>
    /// <typeparam name="T">Type of the value to cache</typeparam>
    /// <param name="key">Cache key</param>
    /// <param name="value">Value to cache</param>
    /// <returns>Completion task</returns>
    Task SetAsync<T>(string key, T value) where T : class;

    /// <summary>
    /// Sets a value in the cache with a specific TTL.
    /// </summary>
    /// <typeparam name="T">Type of the value to cache</typeparam>
    /// <param name="key">Cache key</param>
    /// <param name="value">Value to cache</param>
    /// <param name="ttl">Time-to-live duration</param>
    /// <returns>Completion task</returns>
    Task SetAsync<T>(string key, T value, TimeSpan ttl) where T : class;

    /// <summary>
    /// Removes a specific key from the cache.
    /// </summary>
    /// <param name="key">Cache key to remove</param>
    /// <returns>Completion task</returns>
    Task RemoveAsync(string key);

    /// <summary>
    /// Removes all keys matching a pattern from the cache.
    /// </summary>
    /// <param name="pattern">Pattern to match keys (supports wildcards)</param>
    /// <returns>Completion task</returns>
    Task RemoveByPatternAsync(string pattern);

    /// <summary>
    /// Clears all cached data.
    /// </summary>
    /// <returns>Completion task</returns>
    Task ClearAsync();
}

