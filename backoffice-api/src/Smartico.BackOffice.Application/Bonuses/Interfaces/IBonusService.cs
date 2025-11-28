using MongoDB.Bson;
using Smartico.BackOffice.Application.Bonuses.Commands;
using Smartico.BackOffice.Application.Bonuses.DTOs;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Application.Bonuses.Interfaces;

/// <summary>
/// Service interface for bonus business logic operations.
/// </summary>
public interface IBonusService
{
    /// <summary>
    /// Creates a new bonus for the specified operator.
    /// </summary>
    /// <param name="operatorId">The operator ID creating the bonus.</param>
    /// <param name="command">The bonus creation command.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created bonus as a DTO.</returns>
    Task<BonusDto> CreateBonusAsync(
        ObjectId operatorId,
        CreateBonusCommand command,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a bonus by its ID for the specified operator.
    /// </summary>
    /// <param name="operatorId">The operator ID requesting the bonus.</param>
    /// <param name="bonusId">The bonus ID to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The bonus DTO if found; otherwise, null.</returns>
    Task<BonusDto?> GetBonusByIdAsync(
        ObjectId operatorId,
        ObjectId bonusId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all bonuses for the specified operator.
    /// </summary>
    /// <param name="operatorId">The operator ID requesting bonuses.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of bonus DTOs.</returns>
    Task<List<BonusDto>> GetAllBonusesAsync(
        ObjectId operatorId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing bonus.
    /// </summary>
    /// <param name="operatorId">The operator ID updating the bonus.</param>
    /// <param name="bonusId">The bonus ID to update.</param>
    /// <param name="command">The updated bonus data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated bonus DTO.</returns>
    Task<BonusDto?> UpdateBonusAsync(
        ObjectId operatorId,
        ObjectId bonusId,
        CreateBonusCommand command,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a bonus.
    /// </summary>
    /// <param name="operatorId">The operator ID deleting the bonus.</param>
    /// <param name="bonusId">The bonus ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteBonusAsync(
        ObjectId operatorId,
        ObjectId bonusId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Activates a bonus (changes status from Draft to Active).
    /// </summary>
    /// <param name="operatorId">The operator ID activating the bonus.</param>
    /// <param name="bonusId">The bonus ID to activate.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The activated bonus DTO.</returns>
    Task<BonusDto?> ActivateBonusAsync(
        ObjectId operatorId,
        ObjectId bonusId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Pauses an active bonus.
    /// </summary>
    /// <param name="operatorId">The operator ID pausing the bonus.</param>
    /// <param name="bonusId">The bonus ID to pause.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The paused bonus DTO.</returns>
    Task<BonusDto?> PauseBonusAsync(
        ObjectId operatorId,
        ObjectId bonusId,
        CancellationToken cancellationToken = default);
}
