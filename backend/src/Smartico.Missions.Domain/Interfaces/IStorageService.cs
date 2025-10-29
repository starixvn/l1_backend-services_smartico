namespace Smartico.Missions.Domain.Interfaces;

/// <summary>
/// Interface for simple file-based storage service.
/// Used for MVP data persistence without database complexity.
/// </summary>
/// <typeparam name="T">Type of data to store</typeparam>
public interface IStorageService<T> where T : class
{
    /// <summary>
    /// Reads all data from storage.
    /// </summary>
    /// <returns>Stored data or default value</returns>
    Task<T> ReadAsync();

    /// <summary>
    /// Writes data to storage.
    /// </summary>
    /// <param name="data">Data to write</param>
    /// <returns>Completion task</returns>
    Task WriteAsync(T data);

    /// <summary>
    /// Updates data using an updater function.
    /// Atomically reads, updates, and writes back.
    /// </summary>
    /// <param name="updater">Function to update data</param>
    /// <returns>Completion task</returns>
    Task UpdateAsync(Func<T, T> updater);

    /// <summary>
    /// Clears all data from storage.
    /// </summary>
    /// <returns>Completion task</returns>
    Task ClearAsync();
}

