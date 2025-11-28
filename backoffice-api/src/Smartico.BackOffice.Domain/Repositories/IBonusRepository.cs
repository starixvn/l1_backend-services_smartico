using MongoDB.Bson;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Domain.Repositories;

/// <summary>
/// Repository interface for bonus data access operations.
/// All operations automatically filter by OperatorId for multi-tenant isolation.
/// </summary>
public interface IBonusRepository
{
    /// <summary>
    /// Creates a new bonus in the database.
    /// </summary>
    /// <param name="bonus">The bonus entity to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task CreateAsync(Bonus bonus, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a bonus by its ID, filtered by operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="bonusId">The bonus ID to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The bonus if found and belongs to the operator; otherwise, null.</returns>
    Task<Bonus?> GetByIdAsync(ObjectId operatorId, ObjectId bonusId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all bonuses for a specific operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of bonuses belonging to the operator.</returns>
    Task<List<Bonus>> GetAllAsync(ObjectId operatorId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves bonuses by status for a specific operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="status">The bonus status to filter by.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of bonuses matching the status.</returns>
    Task<List<Bonus>> GetByStatusAsync(ObjectId operatorId, BonusStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a bonus by gift code for a specific operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="giftCode">The gift code to search for.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The bonus if found; otherwise, null.</returns>
    Task<Bonus?> GetByGiftCodeAsync(ObjectId operatorId, string giftCode, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing bonus.
    /// </summary>
    /// <param name="bonus">The bonus entity with updated values.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(Bonus bonus, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a bonus by its ID, filtered by operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="bonusId">The bonus ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(ObjectId operatorId, ObjectId bonusId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a gift code is already in use for a specific operator.
    /// </summary>
    /// <param name="operatorId">The operator ID for multi-tenant filtering.</param>
    /// <param name="giftCode">The gift code to check.</param>
    /// <param name="excludeBonusId">Optional bonus ID to exclude from the check (for updates).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the gift code is already in use; otherwise, false.</returns>
    Task<bool> IsGiftCodeInUseAsync(ObjectId operatorId, string giftCode, ObjectId? excludeBonusId = null, CancellationToken cancellationToken = default);
}
