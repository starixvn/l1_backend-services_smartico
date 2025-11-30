using MongoDB.Bson;
using Smartico.BackOffice.Application.Badges.Commands;
using Smartico.BackOffice.Application.Badges.DTOs;
using Smartico.BackOffice.Application.Badges.Interfaces;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Badges.Services;

/// <summary>
/// Service implementation for badge operations.
/// </summary>
public class BadgeService : IBadgeService
{
    private readonly IBadgeRepository _badgeRepository;
    private readonly IBadgeSeriesRepository _badgeSeriesRepository;

    public BadgeService(IBadgeRepository badgeRepository, IBadgeSeriesRepository badgeSeriesRepository)
    {
        _badgeRepository = badgeRepository;
        _badgeSeriesRepository = badgeSeriesRepository;
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<BadgeDto>> GetAllAsync(ObjectId operatorId)
    {
        var badges = await _badgeRepository.GetAllAsync(operatorId);
        return badges.Select(MapToDto);
    }

    /// <inheritdoc/>
    public async Task<BadgeDto?> GetByIdAsync(string id, ObjectId operatorId)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return null;

        var badge = await _badgeRepository.GetByIdAsync(objectId, operatorId);
        return badge != null ? MapToDto(badge) : null;
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<BadgeDto>> GetBySeriesIdAsync(string seriesId, ObjectId operatorId)
    {
        if (!ObjectId.TryParse(seriesId, out var objectId))
            return Enumerable.Empty<BadgeDto>();

        var badges = await _badgeRepository.GetBySeriesIdAsync(objectId, operatorId);
        return badges.Select(MapToDto);
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<BadgeDto>> GetActiveAsync(ObjectId operatorId)
    {
        var badges = await _badgeRepository.GetActiveAsync(operatorId);
        return badges.Select(MapToDto);
    }

    /// <inheritdoc/>
    public async Task<BadgeDto> CreateAsync(CreateBadgeCommand command, ObjectId operatorId, ObjectId? userId = null)
    {
        var badge = new Badge
        {
            OperatorId = operatorId,
            Name = command.Name,
            Description = command.Description,
            IconUrl = command.IconUrl,
            Rarity = command.Rarity,
            Status = BadgeStatus.Draft,
            UnlockCriteria = MapFromCriteriaDto(command.UnlockCriteria),
            Reward = command.Reward != null ? MapFromRewardDto(command.Reward) : null,
            IsHidden = command.IsHidden,
            ProgressTrackingEnabled = command.ProgressTrackingEnabled,
            SeriesId = !string.IsNullOrEmpty(command.SeriesId) && ObjectId.TryParse(command.SeriesId, out var seriesId)
                ? seriesId
                : null,
            OrderInSeries = command.OrderInSeries,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _badgeRepository.CreateAsync(badge);
        return MapToDto(created);
    }

    /// <inheritdoc/>
    public async Task<BadgeDto?> UpdateAsync(string id, UpdateBadgeCommand command, ObjectId operatorId)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return null;

        var existing = await _badgeRepository.GetByIdAsync(objectId, operatorId);
        if (existing == null)
            return null;

        // Only allow updates to Draft badges, or non-criteria updates to Active badges
        if (existing.Status == BadgeStatus.Archived)
            return null; // Cannot update archived badges

        existing.Name = command.Name;
        existing.Description = command.Description;
        existing.IconUrl = command.IconUrl;
        existing.Rarity = command.Rarity;
        existing.UnlockCriteria = MapFromCriteriaDto(command.UnlockCriteria);
        existing.Reward = command.Reward != null ? MapFromRewardDto(command.Reward) : null;
        existing.IsHidden = command.IsHidden;
        existing.ProgressTrackingEnabled = command.ProgressTrackingEnabled;
        existing.SeriesId = !string.IsNullOrEmpty(command.SeriesId) && ObjectId.TryParse(command.SeriesId, out var seriesId)
            ? seriesId
            : null;
        existing.OrderInSeries = command.OrderInSeries;
        existing.UpdatedAt = DateTime.UtcNow;

        await _badgeRepository.UpdateAsync(existing);
        return MapToDto(existing);
    }

    /// <inheritdoc/>
    public async Task<bool> PublishAsync(string id, ObjectId operatorId)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return false;

        var badge = await _badgeRepository.GetByIdAsync(objectId, operatorId);
        if (badge == null || badge.Status != BadgeStatus.Draft)
            return false;

        badge.Status = BadgeStatus.Active;
        badge.UpdatedAt = DateTime.UtcNow;

        return await _badgeRepository.UpdateAsync(badge);
    }

    /// <inheritdoc/>
    public async Task<bool> ArchiveAsync(string id, ObjectId operatorId)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return false;

        var badge = await _badgeRepository.GetByIdAsync(objectId, operatorId);
        if (badge == null)
            return false;

        badge.Status = BadgeStatus.Archived;
        badge.UpdatedAt = DateTime.UtcNow;

        return await _badgeRepository.UpdateAsync(badge);
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteAsync(string id, ObjectId operatorId)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return false;

        // Only allow deletion of draft badges
        var badge = await _badgeRepository.GetByIdAsync(objectId, operatorId);
        if (badge == null || badge.Status != BadgeStatus.Draft)
            return false;

        return await _badgeRepository.DeleteAsync(objectId, operatorId);
    }

    #region Mapping Helpers

    private static BadgeDto MapToDto(Badge badge)
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
            UnlockCriteria = MapToCriteriaDto(badge.UnlockCriteria),
            Reward = badge.Reward != null ? MapToRewardDto(badge.Reward) : null,
            IsHidden = badge.IsHidden,
            ProgressTrackingEnabled = badge.ProgressTrackingEnabled,
            SeriesId = badge.SeriesId?.ToString(),
            OrderInSeries = badge.OrderInSeries,
            UnlockCount = badge.UnlockCount,
            CreatedAt = badge.CreatedAt,
            UpdatedAt = badge.UpdatedAt
        };
    }

    private static BadgeUnlockCriteriaDto MapToCriteriaDto(BadgeUnlockCriteria criteria)
    {
        return new BadgeUnlockCriteriaDto
        {
            Type = criteria.Type,
            ThresholdValue = criteria.ThresholdValue,
            EligibleGames = criteria.EligibleGames,
            TargetTier = criteria.TargetTier,
            CustomEventName = criteria.CustomEventName,
            Description = criteria.Description
        };
    }

    private static BadgeUnlockCriteria MapFromCriteriaDto(BadgeUnlockCriteriaDto dto)
    {
        return new BadgeUnlockCriteria
        {
            Type = dto.Type,
            ThresholdValue = dto.ThresholdValue,
            EligibleGames = dto.EligibleGames,
            TargetTier = dto.TargetTier,
            CustomEventName = dto.CustomEventName,
            Description = dto.Description
        };
    }

    private static BadgeRewardDto MapToRewardDto(BadgeReward reward)
    {
        return new BadgeRewardDto
        {
            Type = reward.Type,
            Value = reward.Value,
            DurationHours = reward.DurationHours,
            GameId = reward.GameId,
            BonusTemplateId = reward.BonusTemplateId?.ToString(),
            Description = reward.Description
        };
    }

    private static BadgeReward MapFromRewardDto(BadgeRewardDto dto)
    {
        return new BadgeReward
        {
            Type = dto.Type,
            Value = dto.Value,
            DurationHours = dto.DurationHours,
            GameId = dto.GameId,
            BonusTemplateId = !string.IsNullOrEmpty(dto.BonusTemplateId) && ObjectId.TryParse(dto.BonusTemplateId, out var bonusId)
                ? bonusId
                : null,
            Description = dto.Description
        };
    }

    #endregion
}
