using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Interfaces;
using System.Text.Json;

namespace Smartico.Missions.Infrastructure.Storage;

/// <summary>
/// JSON file-based storage service for simple data persistence.
/// Suitable for MVP without database complexity.
/// Provides atomic writes with backup for data safety.
/// </summary>
/// <typeparam name="T">Type of data to store</typeparam>
public class JsonStorageService<T> : IStorageService<T> where T : class
{
    private readonly string _filePath;
    private readonly string _backupPath;
    private readonly T _defaultValue;
    private readonly ILogger<JsonStorageService<T>> _logger;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private readonly JsonSerializerOptions _jsonOptions;

    public JsonStorageService(
        string fileName,
        T defaultValue,
        ILogger<JsonStorageService<T>> logger)
    {
        _defaultValue = defaultValue;
        _logger = logger;

        // Setup file paths
        var dataDir = Path.Combine(Directory.GetCurrentDirectory(), "data");
        Directory.CreateDirectory(dataDir);

        _filePath = Path.Combine(dataDir, fileName);
        _backupPath = $"{_filePath}.backup";

        // JSON serialization options
        _jsonOptions = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        // Ensure file exists
        EnsureFileExists();
    }

    public async Task<T> ReadAsync()
    {
        await _lock.WaitAsync();
        try
        {
            if (!File.Exists(_filePath))
            {
                _logger.LogWarning("Storage file not found: {FilePath}, returning default value", _filePath);
                return _defaultValue;
            }

            var json = await File.ReadAllTextAsync(_filePath);
            var data = JsonSerializer.Deserialize<T>(json, _jsonOptions);

            if (data == null)
            {
                _logger.LogWarning("Failed to deserialize storage file, returning default value");
                return _defaultValue;
            }

            _logger.LogDebug("Successfully read data from {FilePath}", _filePath);
            return data;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading from storage file {FilePath}", _filePath);
            return _defaultValue;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task WriteAsync(T data)
    {
        await _lock.WaitAsync();
        try
        {
            // Create backup of existing file
            if (File.Exists(_filePath))
            {
                File.Copy(_filePath, _backupPath, overwrite: true);
                _logger.LogDebug("Created backup: {BackupPath}", _backupPath);
            }

            // Write to temporary file first (atomic operation)
            var tempPath = $"{_filePath}.tmp";
            var json = JsonSerializer.Serialize(data, _jsonOptions);
            await File.WriteAllTextAsync(tempPath, json);

            // Move temp file to actual file (atomic on most systems)
            File.Move(tempPath, _filePath, overwrite: true);

            _logger.LogDebug("Successfully wrote data to {FilePath}", _filePath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error writing to storage file {FilePath}", _filePath);
            throw new InvalidOperationException($"Failed to write to storage: {_filePath}", ex);
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task UpdateAsync(Func<T, T> updater)
    {
        await _lock.WaitAsync();
        try
        {
            // Read current data
            var currentData = await ReadInternalAsync();

            // Apply updater
            var updatedData = updater(currentData);

            // Write back
            await WriteInternalAsync(updatedData);

            _logger.LogDebug("Successfully updated data in {FilePath}", _filePath);
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task ClearAsync()
    {
        await _lock.WaitAsync();
        try
        {
            await WriteInternalAsync(_defaultValue);
            _logger.LogInformation("Cleared storage file {FilePath}", _filePath);
        }
        finally
        {
            _lock.Release();
        }
    }

    private void EnsureFileExists()
    {
        if (!File.Exists(_filePath))
        {
            var json = JsonSerializer.Serialize(_defaultValue, _jsonOptions);
            File.WriteAllText(_filePath, json);
            _logger.LogInformation("Created new storage file: {FilePath}", _filePath);
        }
    }

    private async Task<T> ReadInternalAsync()
    {
        if (!File.Exists(_filePath))
        {
            return _defaultValue;
        }

        var json = await File.ReadAllTextAsync(_filePath);
        return JsonSerializer.Deserialize<T>(json, _jsonOptions) ?? _defaultValue;
    }

    private async Task WriteInternalAsync(T data)
    {
        // Create backup
        if (File.Exists(_filePath))
        {
            File.Copy(_filePath, _backupPath, overwrite: true);
        }

        // Write atomically
        var tempPath = $"{_filePath}.tmp";
        var json = JsonSerializer.Serialize(data, _jsonOptions);
        await File.WriteAllTextAsync(tempPath, json);
        File.Move(tempPath, _filePath, overwrite: true);
    }
}

