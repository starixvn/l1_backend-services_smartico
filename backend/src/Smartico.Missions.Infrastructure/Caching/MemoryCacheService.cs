using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Smartico.Missions.Domain.Interfaces;
using System.Collections.Concurrent;

namespace Smartico.Missions.Infrastructure.Caching;

/// <summary>
/// In-memory cache service using IMemoryCache.
/// Suitable for single-instance deployments.
/// </summary>
public class MemoryCacheService : ICacheService
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<MemoryCacheService> _logger;
    private readonly CacheOptions _options;
    private readonly ConcurrentDictionary<string, byte> _keys = new();

    public MemoryCacheService(
        IMemoryCache cache,
        IOptions<CacheOptions> options,
        ILogger<MemoryCacheService> logger)
    {
        _cache = cache;
        _options = options.Value;
        _logger = logger;
    }

    public Task<T?> GetAsync<T>(string key) where T : class
    {
        try
        {
            if (_cache.TryGetValue(key, out T? value))
            {
                _logger.LogDebug("Cache HIT for key: {Key}", key);
                return Task.FromResult(value);
            }

            _logger.LogDebug("Cache MISS for key: {Key}", key);
            return Task.FromResult<T?>(null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting cache value for key: {Key}", key);
            return Task.FromResult<T?>(null);
        }
    }

    public Task SetAsync<T>(string key, T value) where T : class
    {
        return SetAsync(key, value, TimeSpan.FromSeconds(_options.DefaultTtlSeconds));
    }

    public Task SetAsync<T>(string key, T value, TimeSpan ttl) where T : class
    {
        try
        {
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = ttl,
                Size = 1 // For size-based eviction
            };

            _cache.Set(key, value, cacheOptions);
            _keys.TryAdd(key, 0);

            _logger.LogDebug("Cached value for key: {Key} with TTL: {Ttl}s", key, ttl.TotalSeconds);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting cache value for key: {Key}", key);
        }

        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key)
    {
        try
        {
            _cache.Remove(key);
            _keys.TryRemove(key, out _);

            _logger.LogDebug("Removed cache entry for key: {Key}", key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cache value for key: {Key}", key);
        }

        return Task.CompletedTask;
    }

    public Task RemoveByPatternAsync(string pattern)
    {
        try
        {
            var regex = new System.Text.RegularExpressions.Regex(
                pattern.Replace("*", ".*"),
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);

            var keysToRemove = _keys.Keys.Where(k => regex.IsMatch(k)).ToList();

            foreach (var key in keysToRemove)
            {
                _cache.Remove(key);
                _keys.TryRemove(key, out _);
            }

            _logger.LogDebug("Removed {Count} cache entries matching pattern: {Pattern}",
                keysToRemove.Count, pattern);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cache entries by pattern: {Pattern}", pattern);
        }

        return Task.CompletedTask;
    }

    public Task ClearAsync()
    {
        try
        {
            foreach (var key in _keys.Keys.ToList())
            {
                _cache.Remove(key);
                _keys.TryRemove(key, out _);
            }

            _logger.LogInformation("Cleared all cache entries");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing cache");
        }

        return Task.CompletedTask;
    }
}

