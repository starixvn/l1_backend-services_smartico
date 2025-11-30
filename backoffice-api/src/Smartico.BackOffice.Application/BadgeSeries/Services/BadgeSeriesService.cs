using MongoDB.Bson;
using Smartico.BackOffice.Application.BadgeSeries.Commands;
using Smartico.BackOffice.Application.BadgeSeries.Interfaces;
using Smartico.BackOffice.Application.Badges.DTOs;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;

namespace Smartico.BackOffice.Application.BadgeSeries.Services;

/// <summary>
/// Service implementation for badge series operations.
/// </summary>
public class BadgeSeriesService : IBadgeSeriesService
{
    private readonly IBadgeSeriesRepository _badgeSeriesRepository;
    private readonly IBadgeRepository _badgeRepository;

    public BadgeSeriesService(IBadgeSeriesRepository badgeSeriesRepository, IBadgeRepository badgeRepository)
    {
        _badgeSeriesRepository = badgeSeriesRepository;
        _badgeRepository = badgeRepository;
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<BadgeSeriesDto>> GetAllAsync(ObjectId operatorId)
    {
        var seriesList = await _badgeSeriesRepository.GetAllAsync(operatorId);
        return seriesList.Select(s => MapToDto(s, null));
    }

    /// <inheritdoc/>
    public async Task<BadgeSeriesDto?> GetByIdAsync(string id, ObjectId operatorId)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return null;

        var series = await _badgeSeriesRepository.GetByIdAsync(objectId, operatorId);
        if (series == null)
            return null;

        // Get badges in this series
        var badges = await _badgeRepository.GetBySeriesIdAsync(objectId, operatorId);
        return MapToDto(series, badges);
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<BadgeSeriesDto>> GetActiveAsync(ObjectId operatorId)
    {
        var seriesList = await _badgeSeriesRepository.GetActiveAsync(operatorId);
        return seriesList.Select(s => MapToDto(s, null));
    }

    /// <inheritdoc/>
    public async Task<BadgeSeriesDto> CreateAsync(CreateBadgeSeriesCommand command, ObjectId operatorId)
    {
        var series = new Domain.Entities.BadgeSeries
        {
            OperatorId = operatorId,
            Name = command.Name,
            Description = command.Description,
            IconUrl = command.IconUrl,
            DisplayOrder = command.DisplayOrder,
            Status = BadgeSeriesStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _badgeSeriesRepository.CreateAsync(series);
        return MapToDto(created, null);
    }

    /// <inheritdoc/>
    public async Task<BadgeSeriesDto?> UpdateAsync(string id, UpdateBadgeSeriesCommand command, ObjectId operatorId)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return null;

        var existing = await _badgeSeriesRepository.GetByIdAsync(objectId, operatorId);
        if (existing == null)
            return null;

        // Only allow updates to Draft or Active series
        if (existing.Status == BadgeSeriesStatus.Archived)
            return null;

        existing.Name = command.Name;
        existing.Description = command.Description;
        existing.IconUrl = command.IconUrl;
        existing.DisplayOrder = command.DisplayOrder;
        existing.UpdatedAt = DateTime.UtcNow;

        await _badgeSeriesRepository.UpdateAsync(existing);
        return MapToDto(existing, null);
    }

    /// <inheritdoc/>
    public async Task<bool> PublishAsync(string id, ObjectId operatorId)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return false;

        var series = await _badgeSeriesRepository.GetByIdAsync(objectId, operatorId);
        if (series == null || series.Status != BadgeSeriesStatus.Draft)
            return false;

        series.Status = BadgeSeriesStatus.Active;
        series.UpdatedAt = DateTime.UtcNow;

        return await _badgeSeriesRepository.UpdateAsync(series);
    }

    /// <inheritdoc/>
    public async Task<bool> ArchiveAsync(string id, ObjectId operatorId)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return false;

        var series = await _badgeSeriesRepository.GetByIdAsync(objectId, operatorId);
        if (series == null)
            return false;

        series.Status = BadgeSeriesStatus.Archived;
        series.UpdatedAt = DateTime.UtcNow;

        return await _badgeSeriesRepository.UpdateAsync(series);
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteAsync(string id, ObjectId operatorId)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return false;

        // Only allow deletion of draft series
        var series = await _badgeSeriesRepository.GetByIdAsync(objectId, operatorId);
        if (series == null || series.Status != BadgeSeriesStatus.Draft)
            return false;

        // Check if series has any badges
        var badges = await _badgeRepository.GetBySeriesIdAsync(objectId, operatorId);
        if (badges.Any())
            return false; // Cannot delete series with badges

        return await _badgeSeriesRepository.DeleteAsync(objectId, operatorId);
    }

    #region Mapping Helpers

    private static BadgeSeriesDto MapToDto(Domain.Entities.BadgeSeries series, IEnumerable<Badge>? badges)
    {
        return new BadgeSeriesDto
        {
            Id = series.Id.ToString(),
            OperatorId = series.OperatorId.ToString(),
            Name = series.Name,
            Description = series.Description,
            IconUrl = series.IconUrl,
            DisplayOrder = series.DisplayOrder,
            Status = series.Status,
            Badges = badges?.Select(MapBadgeToDto).ToList(),
            CreatedAt = series.CreatedAt,
            UpdatedAt = series.UpdatedAt
        };
    }

    private static BadgeDto MapBadgeToDto(Badge badge)
    {
        return new BadgeDto
        {
            Id = badge.Id.ToString(),
            OperatorId = badge.OperatorId.ToString(),
            Name = badge.Name,
            Description = badge.Description,
            IconUrl = badge.IconUrl,
            Rarity = badge.Rarity,
            Status = badge.Status,
            UnlockCriteria = new BadgeUnlockCriteriaDto
            {
                Type = badge.UnlockCriteria.Type,
                ThresholdValue = badge.UnlockCriteria.ThresholdValue,
                EligibleGames = badge.UnlockCriteria.EligibleGames,
                TargetTier = badge.UnlockCriteria.TargetTier,
                CustomEventName = badge.UnlockCriteria.CustomEventName,
                Description = badge.UnlockCriteria.Description
            },
            Reward = badge.Reward != null ? new BadgeRewardDto
            {
                Type = badge.Reward.Type,
                Value = badge.Reward.Value,
                DurationHours = badge.Reward.DurationHours,
                GameId = badge.Reward.GameId,
                BonusTemplateId = badge.Reward.BonusTemplateId?.ToString(),
                Description = badge.Reward.Description
            } : null,
            IsHidden = badge.IsHidden,
            ProgressTrackingEnabled = badge.ProgressTrackingEnabled,
            SeriesId = badge.SeriesId?.ToString(),
            OrderInSeries = badge.OrderInSeries,
            UnlockCount = badge.UnlockCount,
            CreatedAt = badge.CreatedAt,
            UpdatedAt = badge.UpdatedAt
        };
    }

    #endregion
}
