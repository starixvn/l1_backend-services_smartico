using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using Smartico.Missions.Domain.Interfaces;
using BackOfficeBadge = Smartico.BackOffice.Domain.Entities.Badge;
using BackOfficeBadgeStatus = Smartico.BackOffice.Domain.Entities.BadgeStatus;

namespace Smartico.Missions.Infrastructure.Repositories;

/// <summary>
/// MongoDB implementation of IBadgeReadRepository.
/// Reads badges from the shared backoffice database.
/// </summary>
public class BadgeReadRepository : IBadgeReadRepository
{
    private readonly IMongoCollection<BackOfficeBadge> _collection;
    private readonly ILogger<BadgeReadRepository> _logger;
    private const string CollectionName = "badges";

    public BadgeReadRepository(
        IMongoDatabase database,
        ILogger<BadgeReadRepository> logger)
    {
        _collection = database.GetCollection<BackOfficeBadge>(CollectionName);
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<List<BackOfficeBadge>> GetActiveBadgesAsync(
        ObjectId operatorId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogDebug(
            "Fetching active badges for operator {OperatorId}",
            operatorId);

        var filter = Builders<BackOfficeBadge>.Filter.And(
            Builders<BackOfficeBadge>.Filter.Eq(b => b.OperatorId, operatorId),
            Builders<BackOfficeBadge>.Filter.Eq(b => b.Status, BackOfficeBadgeStatus.Active)
        );

        var badges = await _collection
            .Find(filter)
            .SortByDescending(b => b.Rarity)
            .ThenByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);

        _logger.LogInformation(
            "Found {Count} active badges for operator {OperatorId}",
            badges.Count,
            operatorId);

        return badges;
    }

    /// <inheritdoc />
    public async Task<BackOfficeBadge?> GetByIdAsync(
        ObjectId operatorId,
        ObjectId badgeId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogDebug(
            "Fetching badge {BadgeId} for operator {OperatorId}",
            badgeId,
            operatorId);

        var filter = Builders<BackOfficeBadge>.Filter.And(
            Builders<BackOfficeBadge>.Filter.Eq(b => b.OperatorId, operatorId),
            Builders<BackOfficeBadge>.Filter.Eq(b => b.Id, badgeId)
        );

        var badge = await _collection
            .Find(filter)
            .FirstOrDefaultAsync(cancellationToken);

        if (badge == null)
        {
            _logger.LogWarning(
                "Badge {BadgeId} not found for operator {OperatorId}",
                badgeId,
                operatorId);
        }

        return badge;
    }
}
