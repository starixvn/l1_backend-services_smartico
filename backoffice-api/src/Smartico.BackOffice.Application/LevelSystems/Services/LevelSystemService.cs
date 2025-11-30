using FluentValidation;
using MongoDB.Bson;
using Smartico.BackOffice.Application.LevelSystems.Commands;
using Smartico.BackOffice.Application.LevelSystems.DTOs;
using Smartico.BackOffice.Application.LevelSystems.Interfaces;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;

namespace Smartico.BackOffice.Application.LevelSystems.Services;

/// <summary>
/// Service implementation for level system business logic operations.
/// </summary>
public class LevelSystemService : ILevelSystemService
{
    private readonly ILevelSystemRepository _levelSystemRepository;
    private readonly IValidator<CreateLevelSystemCommand> _validator;

    public LevelSystemService(
        ILevelSystemRepository levelSystemRepository,
        IValidator<CreateLevelSystemCommand> validator)
    {
        _levelSystemRepository = levelSystemRepository;
        _validator = validator;
    }

    /// <inheritdoc/>
    public async Task<LevelSystemDto> CreateLevelSystemAsync(
        ObjectId operatorId,
        CreateLevelSystemCommand command,
        CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // Check name uniqueness
        var nameInUse = await _levelSystemRepository.IsNameInUseAsync(
            operatorId, command.Name, null, cancellationToken);
        if (nameInUse)
        {
            throw new ValidationException("A level system with this name already exists.");
        }

        var levelSystem = MapCommandToEntity(command);
        levelSystem.OperatorId = operatorId;
        levelSystem.Status = LevelSystemStatus.Draft;

        await _levelSystemRepository.CreateAsync(levelSystem, cancellationToken);

        return MapEntityToDto(levelSystem);
    }

    /// <inheritdoc/>
    public async Task<LevelSystemDto?> GetLevelSystemByIdAsync(
        ObjectId operatorId,
        ObjectId levelSystemId,
        CancellationToken cancellationToken = default)
    {
        var levelSystem = await _levelSystemRepository.GetByIdAsync(operatorId, levelSystemId, cancellationToken);
        return levelSystem != null ? MapEntityToDto(levelSystem) : null;
    }

    /// <inheritdoc/>
    public async Task<List<LevelSystemDto>> GetAllLevelSystemsAsync(
        ObjectId operatorId,
        CancellationToken cancellationToken = default)
    {
        var levelSystems = await _levelSystemRepository.GetAllAsync(operatorId, cancellationToken);
        return levelSystems.Select(MapEntityToDto).ToList();
    }

    /// <inheritdoc/>
    public async Task<LevelSystemDto?> GetActiveLevelSystemAsync(
        ObjectId operatorId,
        CancellationToken cancellationToken = default)
    {
        var levelSystem = await _levelSystemRepository.GetActiveAsync(operatorId, cancellationToken);
        return levelSystem != null ? MapEntityToDto(levelSystem) : null;
    }

    /// <inheritdoc/>
    public async Task<LevelSystemDto?> UpdateLevelSystemAsync(
        ObjectId operatorId,
        ObjectId levelSystemId,
        CreateLevelSystemCommand command,
        CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var existing = await _levelSystemRepository.GetByIdAsync(operatorId, levelSystemId, cancellationToken);
        if (existing == null)
        {
            return null;
        }

        // Check name uniqueness if changed
        if (command.Name != existing.Name)
        {
            var nameInUse = await _levelSystemRepository.IsNameInUseAsync(
                operatorId, command.Name, levelSystemId, cancellationToken);
            if (nameInUse)
            {
                throw new ValidationException("A level system with this name already exists.");
            }
        }

        // Update entity fields
        existing.Name = command.Name;
        existing.Description = command.Description;
        existing.MaxLevel = command.MaxLevel;
        existing.ProgressionCurve = command.ProgressionCurve;
        existing.BaseXpRequired = command.BaseXpRequired;
        existing.XpMultiplier = command.XpMultiplier;
        existing.Tiers = command.Tiers.Select(MapTierDtoToEntity).ToList();
        existing.XpRules = command.XpRules.Select(MapXpRuleDtoToEntity).ToList();
        existing.LevelRewards = command.LevelRewards.Select(MapLevelRewardDtoToEntity).ToList();
        existing.DemotionEnabled = command.DemotionEnabled;
        existing.DemotionRules = MapDemotionRulesDtoToEntity(command.DemotionRules);

        await _levelSystemRepository.UpdateAsync(existing, cancellationToken);

        return MapEntityToDto(existing);
    }

    /// <inheritdoc/>
    public async Task DeleteLevelSystemAsync(
        ObjectId operatorId,
        ObjectId levelSystemId,
        CancellationToken cancellationToken = default)
    {
        var existing = await _levelSystemRepository.GetByIdAsync(operatorId, levelSystemId, cancellationToken);
        if (existing != null && existing.Status == LevelSystemStatus.Active)
        {
            throw new InvalidOperationException("Cannot delete an active level system. Please deactivate it first.");
        }

        await _levelSystemRepository.DeleteAsync(operatorId, levelSystemId, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<LevelSystemDto?> ActivateLevelSystemAsync(
        ObjectId operatorId,
        ObjectId levelSystemId,
        CancellationToken cancellationToken = default)
    {
        var levelSystem = await _levelSystemRepository.GetByIdAsync(operatorId, levelSystemId, cancellationToken);
        if (levelSystem == null)
        {
            return null;
        }

        if (levelSystem.Status != LevelSystemStatus.Draft && levelSystem.Status != LevelSystemStatus.Paused)
        {
            throw new InvalidOperationException($"Cannot activate level system with status {levelSystem.Status}.");
        }

        // Deactivate any currently active level system
        var currentActive = await _levelSystemRepository.GetActiveAsync(operatorId, cancellationToken);
        if (currentActive != null && currentActive.Id != levelSystemId)
        {
            currentActive.Status = LevelSystemStatus.Paused;
            await _levelSystemRepository.UpdateAsync(currentActive, cancellationToken);
        }

        levelSystem.Status = LevelSystemStatus.Active;
        await _levelSystemRepository.UpdateAsync(levelSystem, cancellationToken);

        return MapEntityToDto(levelSystem);
    }

    /// <inheritdoc/>
    public async Task<LevelSystemDto?> PauseLevelSystemAsync(
        ObjectId operatorId,
        ObjectId levelSystemId,
        CancellationToken cancellationToken = default)
    {
        var levelSystem = await _levelSystemRepository.GetByIdAsync(operatorId, levelSystemId, cancellationToken);
        if (levelSystem == null)
        {
            return null;
        }

        if (levelSystem.Status != LevelSystemStatus.Active)
        {
            throw new InvalidOperationException($"Cannot pause level system with status {levelSystem.Status}.");
        }

        levelSystem.Status = LevelSystemStatus.Paused;
        await _levelSystemRepository.UpdateAsync(levelSystem, cancellationToken);

        return MapEntityToDto(levelSystem);
    }

    /// <inheritdoc/>
    public async Task<List<LevelPreviewDto>> GetLevelPreviewAsync(
        ObjectId operatorId,
        ObjectId levelSystemId,
        CancellationToken cancellationToken = default)
    {
        var levelSystem = await _levelSystemRepository.GetByIdAsync(operatorId, levelSystemId, cancellationToken);
        if (levelSystem == null)
        {
            return new List<LevelPreviewDto>();
        }

        var previews = new List<LevelPreviewDto>();
        long totalXp = 0;

        for (int level = 1; level <= levelSystem.MaxLevel; level++)
        {
            var xpRequired = CalculateXpForLevel(levelSystem, level);
            totalXp += xpRequired;

            var tier = levelSystem.Tiers.FirstOrDefault(t => level >= t.FromLevel && level <= t.ToLevel);
            var rewards = levelSystem.LevelRewards
                .Where(r => r.Level == level)
                .Select(MapLevelRewardEntityToDto)
                .ToList();

            previews.Add(new LevelPreviewDto
            {
                Level = level,
                XpRequired = xpRequired,
                TotalXpRequired = totalXp,
                TierName = tier?.Name,
                TierColor = tier?.Color,
                Rewards = rewards
            });
        }

        return previews;
    }

    #region Private Helper Methods

    private static long CalculateXpForLevel(LevelSystem levelSystem, int level)
    {
        if (level <= 1) return 0;

        return levelSystem.ProgressionCurve switch
        {
            ProgressionCurveType.Linear => levelSystem.BaseXpRequired * (level - 1),
            ProgressionCurveType.Exponential => (long)(levelSystem.BaseXpRequired * Math.Pow((double)levelSystem.XpMultiplier, level - 2)),
            _ => levelSystem.BaseXpRequired
        };
    }

    private static LevelSystem MapCommandToEntity(CreateLevelSystemCommand command)
    {
        return new LevelSystem
        {
            Name = command.Name,
            Description = command.Description,
            MaxLevel = command.MaxLevel,
            ProgressionCurve = command.ProgressionCurve,
            BaseXpRequired = command.BaseXpRequired,
            XpMultiplier = command.XpMultiplier,
            Tiers = command.Tiers.Select(MapTierDtoToEntity).ToList(),
            XpRules = command.XpRules.Select(MapXpRuleDtoToEntity).ToList(),
            LevelRewards = command.LevelRewards.Select(MapLevelRewardDtoToEntity).ToList(),
            DemotionEnabled = command.DemotionEnabled,
            DemotionRules = MapDemotionRulesDtoToEntity(command.DemotionRules)
        };
    }

    private static LevelSystemDto MapEntityToDto(LevelSystem entity)
    {
        return new LevelSystemDto
        {
            Id = entity.Id.ToString(),
            OperatorId = entity.OperatorId.ToString(),
            Name = entity.Name,
            Description = entity.Description,
            Status = entity.Status,
            MaxLevel = entity.MaxLevel,
            ProgressionCurve = entity.ProgressionCurve,
            BaseXpRequired = entity.BaseXpRequired,
            XpMultiplier = entity.XpMultiplier,
            Tiers = entity.Tiers.Select(MapTierEntityToDto).ToList(),
            XpRules = entity.XpRules.Select(MapXpRuleEntityToDto).ToList(),
            LevelRewards = entity.LevelRewards.Select(MapLevelRewardEntityToDto).ToList(),
            DemotionEnabled = entity.DemotionEnabled,
            DemotionRules = MapDemotionRulesEntityToDto(entity.DemotionRules),
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    private static LevelTier MapTierDtoToEntity(LevelTierDto dto)
    {
        return new LevelTier
        {
            Id = string.IsNullOrEmpty(dto.Id) ? Guid.NewGuid().ToString() : dto.Id,
            Name = dto.Name,
            FromLevel = dto.FromLevel,
            ToLevel = dto.ToLevel,
            Color = dto.Color,
            Icon = dto.Icon,
            Order = dto.Order,
            Benefits = dto.Benefits.Select(MapBenefitDtoToEntity).ToList()
        };
    }

    private static LevelTierDto MapTierEntityToDto(LevelTier entity)
    {
        return new LevelTierDto
        {
            Id = entity.Id,
            Name = entity.Name,
            FromLevel = entity.FromLevel,
            ToLevel = entity.ToLevel,
            Color = entity.Color,
            Icon = entity.Icon,
            Order = entity.Order,
            Benefits = entity.Benefits.Select(MapBenefitEntityToDto).ToList()
        };
    }

    private static TierBenefit MapBenefitDtoToEntity(TierBenefitDto dto)
    {
        return new TierBenefit
        {
            Type = dto.Type,
            Description = dto.Description,
            Value = dto.Value
        };
    }

    private static TierBenefitDto MapBenefitEntityToDto(TierBenefit entity)
    {
        return new TierBenefitDto
        {
            Type = entity.Type,
            Description = entity.Description,
            Value = entity.Value
        };
    }

    private static XpRule MapXpRuleDtoToEntity(XpRuleDto dto)
    {
        return new XpRule
        {
            Id = string.IsNullOrEmpty(dto.Id) ? Guid.NewGuid().ToString() : dto.Id,
            ActionType = dto.ActionType,
            XpAmount = dto.XpAmount,
            PerUnitAmount = dto.PerUnitAmount,
            DailyCap = dto.DailyCap,
            EligibleGames = dto.EligibleGames,
            IsActive = dto.IsActive,
            Description = dto.Description
        };
    }

    private static XpRuleDto MapXpRuleEntityToDto(XpRule entity)
    {
        return new XpRuleDto
        {
            Id = entity.Id,
            ActionType = entity.ActionType,
            XpAmount = entity.XpAmount,
            PerUnitAmount = entity.PerUnitAmount,
            DailyCap = entity.DailyCap,
            EligibleGames = entity.EligibleGames,
            IsActive = entity.IsActive,
            Description = entity.Description
        };
    }

    private static LevelReward MapLevelRewardDtoToEntity(LevelRewardDto dto)
    {
        return new LevelReward
        {
            Id = string.IsNullOrEmpty(dto.Id) ? Guid.NewGuid().ToString() : dto.Id,
            Level = dto.Level,
            RewardType = dto.RewardType,
            Value = dto.Value,
            BonusTemplateId = dto.BonusTemplateId,
            BonusTemplateName = dto.BonusTemplateName,
            BadgeId = dto.BadgeId,
            BadgeName = dto.BadgeName,
            Description = dto.Description
        };
    }

    private static LevelRewardDto MapLevelRewardEntityToDto(LevelReward entity)
    {
        return new LevelRewardDto
        {
            Id = entity.Id,
            Level = entity.Level,
            RewardType = entity.RewardType,
            Value = entity.Value,
            BonusTemplateId = entity.BonusTemplateId,
            BonusTemplateName = entity.BonusTemplateName,
            BadgeId = entity.BadgeId,
            BadgeName = entity.BadgeName,
            Description = entity.Description
        };
    }

    private static DemotionRules? MapDemotionRulesDtoToEntity(DemotionRulesDto? dto)
    {
        if (dto == null) return null;
        return new DemotionRules
        {
            InactiveDays = dto.InactiveDays,
            DemotionType = dto.DemotionType,
            WarningDays = dto.WarningDays,
            PreserveXp = dto.PreserveXp
        };
    }

    private static DemotionRulesDto? MapDemotionRulesEntityToDto(DemotionRules? entity)
    {
        if (entity == null) return null;
        return new DemotionRulesDto
        {
            InactiveDays = entity.InactiveDays,
            DemotionType = entity.DemotionType,
            WarningDays = entity.WarningDays,
            PreserveXp = entity.PreserveXp
        };
    }

    #endregion
}
