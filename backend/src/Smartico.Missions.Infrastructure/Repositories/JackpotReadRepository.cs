using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using Smartico.BackOffice.Domain.Entities;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of IJackpotReadRepository.
/// Reads jackpots from the shared backoffice database.
/// </summary>
public class JackpotReadRepository : IJackpotReadRepository
{
    private readonly IMongoCollection<Jackpot> _collection;
    private readonly ILogger<JackpotReadRepository> _logger;
    private const string CollectionName = "jackpots";

    public JackpotReadRepository(
        IMongoDatabase database,
        ILogger<JackpotReadRepository> logger)
    {
        _collection = database.GetCollection<Jackpot>(CollectionName);
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<List<Jackpot>> GetActiveJackpotsAsync(
        ObjectId operatorId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogDebug(
            "Fetching active jackpots for operator {OperatorId}",
            operatorId);

        var filter = Builders<Jackpot>.Filter.And(
            Builders<Jackpot>.Filter.Eq(j => j.OperatorId, operatorId),
            Builders<Jackpot>.Filter.Eq(j => j.Status, JackpotStatus.Active)
        );

        var jackpots = await _collection
            .Find(filter)
            .SortByDescending(j => j.CreatedAt)
            .ToListAsync(cancellationToken);

        _logger.LogInformation(
            "Found {Count} active jackpots for operator {OperatorId}",
            jackpots.Count,
            operatorId);

        return jackpots;
    }

    /// <inheritdoc />
    public async Task<Jackpot?> GetByIdAsync(
        ObjectId operatorId,
        ObjectId jackpotId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogDebug(
            "Fetching jackpot {JackpotId} for operator {OperatorId}",
            jackpotId,
            operatorId);

        var filter = Builders<Jackpot>.Filter.And(
            Builders<Jackpot>.Filter.Eq(j => j.OperatorId, operatorId),
            Builders<Jackpot>.Filter.Eq(j => j.Id, jackpotId)
        );

        var jackpot = await _collection
            .Find(filter)
            .FirstOrDefaultAsync(cancellationToken);

        if (jackpot == null)
        {
            _logger.LogWarning(
                "Jackpot {JackpotId} not found for operator {OperatorId}",
                jackpotId,
                operatorId);
        }

        return jackpot;
    }
}
