using MongoDB.Bson;
using Smartico.BackOffice.Application.Jackpots.Commands;
using Smartico.BackOffice.Application.Jackpots.DTOs;

namespace Smartico.BackOffice.Application.Jackpots.Interfaces;

/// <summary>
/// Service interface for jackpot operations.
/// </summary>
public interface IJackpotService
{
    /// <summary>
    /// Gets all jackpots for the current operator.
    /// </summary>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>List of jackpot DTOs.</returns>
    Task<IEnumerable<JackpotDto>> GetAllAsync(ObjectId operatorId);

    /// <summary>
    /// Gets a jackpot by ID.
    /// </summary>
    /// <param name="id">The jackpot ID.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>The jackpot DTO if found, null otherwise.</returns>
    Task<JackpotDto?> GetByIdAsync(string id, ObjectId operatorId);

    /// <summary>
    /// Gets all active jackpots for the current operator.
    /// </summary>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>List of active jackpot DTOs.</returns>
    Task<IEnumerable<JackpotDto>> GetActiveAsync(ObjectId operatorId);

    /// <summary>
    /// Creates a new jackpot.
    /// </summary>
    /// <param name="command">The create jackpot command.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <param name="userId">The creating user's ID.</param>
    /// <returns>The created jackpot DTO.</returns>
    Task<JackpotDto> CreateAsync(CreateJackpotCommand command, ObjectId operatorId, ObjectId? userId = null);

    /// <summary>
    /// Updates an existing jackpot.
    /// Only allowed when jackpot is in Draft status.
    /// </summary>
    /// <param name="id">The jackpot ID to update.</param>
    /// <param name="command">The update jackpot command.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>The updated jackpot DTO if found, null otherwise.</returns>
    Task<JackpotDto?> UpdateAsync(string id, UpdateJackpotCommand command, ObjectId operatorId);

    /// <summary>
    /// Activates a jackpot.
    /// Transitions from Draft to Active status.
    /// </summary>
    /// <param name="id">The jackpot ID to activate.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>True if activated, false if not found or not in Draft status.</returns>
    Task<bool> ActivateAsync(string id, ObjectId operatorId);

    /// <summary>
    /// Pauses an active jackpot.
    /// Transitions from Active to Paused status.
    /// </summary>
    /// <param name="id">The jackpot ID to pause.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>True if paused, false if not found or not Active.</returns>
    Task<bool> PauseAsync(string id, ObjectId operatorId);

    /// <summary>
    /// Resumes a paused jackpot.
    /// Transitions from Paused to Active status.
    /// </summary>
    /// <param name="id">The jackpot ID to resume.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>True if resumed, false if not found or not Paused.</returns>
    Task<bool> ResumeAsync(string id, ObjectId operatorId);

    /// <summary>
    /// Archives a jackpot.
    /// </summary>
    /// <param name="id">The jackpot ID to archive.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>True if archived, false if not found.</returns>
    Task<bool> ArchiveAsync(string id, ObjectId operatorId);

    /// <summary>
    /// Deletes a jackpot.
    /// Only allowed when jackpot is in Draft status.
    /// </summary>
    /// <param name="id">The jackpot ID to delete.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <returns>True if deleted, false if not found or not in Draft status.</returns>
    Task<bool> DeleteAsync(string id, ObjectId operatorId);
}
