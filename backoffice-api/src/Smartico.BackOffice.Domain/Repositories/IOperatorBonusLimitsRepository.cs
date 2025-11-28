using MongoDB.Bson;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Domain.Repositories;

/// <summary>
/// Repository interface for OperatorBonusLimits entities.
/// Manages global bonus limits for operators.
/// </summary>
public interface IOperatorBonusLimitsRepository
{
    /// <summary>
    /// Gets the bonus limits for an operator.
    /// Returns null if no limits are configured.
    /// </summary>
    Task<OperatorBonusLimits?> GetByOperatorIdAsync(ObjectId operatorId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates or updates the bonus limits for an operator.
    /// </summary>
    Task<OperatorBonusLimits> UpsertAsync(OperatorBonusLimits limits, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes the bonus limits for an operator.
    /// </summary>
    Task<bool> DeleteAsync(ObjectId operatorId, CancellationToken cancellationToken = default);
}
