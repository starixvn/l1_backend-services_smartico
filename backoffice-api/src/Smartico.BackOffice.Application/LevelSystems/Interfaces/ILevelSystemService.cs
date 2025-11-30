using MongoDB.Bson;
using Smartico.BackOffice.Application.LevelSystems.Commands;
using Smartico.BackOffice.Application.LevelSystems.DTOs;

namespace Smartico.BackOffice.Application.LevelSystems.Interfaces;

/// <summary>
/// Service interface for level system business logic operations.
/// </summary>
public interface ILevelSystemService
{
    /// <summary>
    /// Creates a new level system.
    /// </summary>
    Task<LevelSystemDto> CreateLevelSystemAsync(
        ObjectId operatorId,
        CreateLevelSystemCommand command,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a level system by ID.
    /// </summary>
    Task<LevelSystemDto?> GetLevelSystemByIdAsync(
        ObjectId operatorId,
        ObjectId levelSystemId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all level systems for an operator.
    /// </summary>
    Task<List<LevelSystemDto>> GetAllLevelSystemsAsync(
        ObjectId operatorId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves the active level system for an operator.
    /// </summary>
    Task<LevelSystemDto?> GetActiveLevelSystemAsync(
        ObjectId operatorId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing level system.
    /// </summary>
    Task<LevelSystemDto?> UpdateLevelSystemAsync(
        ObjectId operatorId,
        ObjectId levelSystemId,
        CreateLevelSystemCommand command,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a level system.
    /// </summary>
    Task DeleteLevelSystemAsync(
        ObjectId operatorId,
        ObjectId levelSystemId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Activates a level system (deactivates any currently active system).
    /// </summary>
    Task<LevelSystemDto?> ActivateLevelSystemAsync(
        ObjectId operatorId,
        ObjectId levelSystemId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Pauses a level system.
    /// </summary>
    Task<LevelSystemDto?> PauseLevelSystemAsync(
        ObjectId operatorId,
        ObjectId levelSystemId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a preview of all levels with XP thresholds.
    /// </summary>
    Task<List<LevelPreviewDto>> GetLevelPreviewAsync(
        ObjectId operatorId,
        ObjectId levelSystemId,
        CancellationToken cancellationToken = default);
}
