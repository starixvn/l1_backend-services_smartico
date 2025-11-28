using FluentValidation;
using MongoDB.Bson;
using Smartico.BackOffice.Application.Bonuses.Commands;
using Smartico.BackOffice.Application.Bonuses.DTOs;
using Smartico.BackOffice.Application.Bonuses.Interfaces;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Bonuses.Services;

/// <summary>
/// Service implementation for bonus business logic operations.
/// Bonuses are templates that define reward calculation rules.
/// They can be issued through various channels (missions, tournaments, store, etc.).
/// </summary>
public class BonusService : IBonusService
{
    private readonly IBonusRepository _bonusRepository;
    private readonly IValidator<CreateBonusCommand> _validator;

    /// <summary>
    /// Initializes a new instance of the <see cref="BonusService"/> class.
    /// </summary>
    public BonusService(
        IBonusRepository bonusRepository,
        IValidator<CreateBonusCommand> validator)
    {
        _bonusRepository = bonusRepository;
        _validator = validator;
    }

    /// <inheritdoc/>
    public async Task<BonusDto> CreateBonusAsync(
        ObjectId operatorId,
        CreateBonusCommand command,
        CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // Check gift code uniqueness if provided
        if (!string.IsNullOrEmpty(command.GiftCode))
        {
            var codeInUse = await _bonusRepository.IsGiftCodeInUseAsync(
                operatorId, command.GiftCode, null, cancellationToken);
            if (codeInUse)
            {
                throw new ValidationException("Gift code is already in use.");
            }
        }

        var bonus = MapCommandToEntity(command);
        bonus.OperatorId = operatorId;
        bonus.Status = BonusStatus.Draft;

        await _bonusRepository.CreateAsync(bonus, cancellationToken);

        return MapEntityToDto(bonus);
    }

    /// <inheritdoc/>
    public async Task<BonusDto?> GetBonusByIdAsync(
        ObjectId operatorId,
        ObjectId bonusId,
        CancellationToken cancellationToken = default)
    {
        var bonus = await _bonusRepository.GetByIdAsync(operatorId, bonusId, cancellationToken);
        return bonus != null ? MapEntityToDto(bonus) : null;
    }

    /// <inheritdoc/>
    public async Task<List<BonusDto>> GetAllBonusesAsync(
        ObjectId operatorId,
        CancellationToken cancellationToken = default)
    {
        var bonuses = await _bonusRepository.GetAllAsync(operatorId, cancellationToken);
        return bonuses.Select(MapEntityToDto).ToList();
    }

    /// <inheritdoc/>
    public async Task<BonusDto?> UpdateBonusAsync(
        ObjectId operatorId,
        ObjectId bonusId,
        CreateBonusCommand command,
        CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var existing = await _bonusRepository.GetByIdAsync(operatorId, bonusId, cancellationToken);
        if (existing == null)
        {
            return null;
        }

        // Check gift code uniqueness if changed
        if (!string.IsNullOrEmpty(command.GiftCode) && command.GiftCode != existing.GiftCode)
        {
            var codeInUse = await _bonusRepository.IsGiftCodeInUseAsync(
                operatorId, command.GiftCode, bonusId, cancellationToken);
            if (codeInUse)
            {
                throw new ValidationException("Gift code is already in use.");
            }
        }

        // Update entity fields
        existing.Name = command.Name;
        existing.Description = command.Description;
        existing.Type = command.Type;
        existing.ActivationType = command.ActivationType;
        existing.GiftCode = command.GiftCode;
        existing.FreeSpins = MapFreeSpinsConfig(command.FreeSpins);
        existing.Cash = MapCashConfig(command.Cash);
        existing.Points = MapPointsConfig(command.Points);
        existing.StartDate = command.StartDate;
        existing.EndDate = command.EndDate;
        existing.CalculationRule = MapCalculationRule(command.CalculationRule);
        existing.Limits = MapBonusLimits(command.Limits);

        await _bonusRepository.UpdateAsync(existing, cancellationToken);

        return MapEntityToDto(existing);
    }

    /// <inheritdoc/>
    public async Task DeleteBonusAsync(
        ObjectId operatorId,
        ObjectId bonusId,
        CancellationToken cancellationToken = default)
    {
        await _bonusRepository.DeleteAsync(operatorId, bonusId, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<BonusDto?> ActivateBonusAsync(
        ObjectId operatorId,
        ObjectId bonusId,
        CancellationToken cancellationToken = default)
    {
        var bonus = await _bonusRepository.GetByIdAsync(operatorId, bonusId, cancellationToken);
        if (bonus == null)
        {
            return null;
        }

        if (bonus.Status != BonusStatus.Draft && bonus.Status != BonusStatus.Paused)
        {
            throw new InvalidOperationException($"Cannot activate bonus with status {bonus.Status}.");
        }

        bonus.Status = BonusStatus.Active;
        await _bonusRepository.UpdateAsync(bonus, cancellationToken);

        return MapEntityToDto(bonus);
    }

    /// <inheritdoc/>
    public async Task<BonusDto?> PauseBonusAsync(
        ObjectId operatorId,
        ObjectId bonusId,
        CancellationToken cancellationToken = default)
    {
        var bonus = await _bonusRepository.GetByIdAsync(operatorId, bonusId, cancellationToken);
        if (bonus == null)
        {
            return null;
        }

        if (bonus.Status != BonusStatus.Active)
        {
            throw new InvalidOperationException($"Cannot pause bonus with status {bonus.Status}.");
        }

        bonus.Status = BonusStatus.Paused;
        await _bonusRepository.UpdateAsync(bonus, cancellationToken);

        return MapEntityToDto(bonus);
    }

    #region Mapping Methods

    private static Bonus MapCommandToEntity(CreateBonusCommand command)
    {
        return new Bonus
        {
            Name = command.Name,
            Description = command.Description,
            Type = command.Type,
            ActivationType = command.ActivationType,
            GiftCode = command.GiftCode,
            FreeSpins = MapFreeSpinsConfig(command.FreeSpins),
            Cash = MapCashConfig(command.Cash),
            Points = MapPointsConfig(command.Points),
            StartDate = command.StartDate,
            EndDate = command.EndDate,
            CalculationRule = MapCalculationRule(command.CalculationRule),
            Limits = MapBonusLimits(command.Limits)
        };
    }

    private static BonusDto MapEntityToDto(Bonus bonus)
    {
        return new BonusDto
        {
            Id = bonus.Id.ToString(),
            OperatorId = bonus.OperatorId.ToString(),
            Name = bonus.Name,
            Description = bonus.Description,
            Type = bonus.Type,
            Status = bonus.Status,
            ActivationType = bonus.ActivationType,
            GiftCode = bonus.GiftCode,
            FreeSpins = MapFreeSpinsConfigDto(bonus.FreeSpins),
            Cash = MapCashConfigDto(bonus.Cash),
            Points = MapPointsConfigDto(bonus.Points),
            StartDate = bonus.StartDate,
            EndDate = bonus.EndDate,
            CalculationRule = MapCalculationRuleDto(bonus.CalculationRule),
            Limits = MapBonusLimitsDto(bonus.Limits),
            CreatedAt = bonus.CreatedAt,
            UpdatedAt = bonus.UpdatedAt
        };
    }

    private static FreeSpinsConfig? MapFreeSpinsConfig(FreeSpinsConfigDto? dto)
    {
        if (dto == null) return null;
        return new FreeSpinsConfig
        {
            NumberOfSpins = dto.NumberOfSpins,
            SpinValue = dto.SpinValue,
            GameId = dto.GameId,
            GameName = dto.GameName
        };
    }

    private static FreeSpinsConfigDto? MapFreeSpinsConfigDto(FreeSpinsConfig? config)
    {
        if (config == null) return null;
        return new FreeSpinsConfigDto
        {
            NumberOfSpins = config.NumberOfSpins,
            SpinValue = config.SpinValue,
            GameId = config.GameId,
            GameName = config.GameName
        };
    }

    private static CashConfig? MapCashConfig(CashConfigDto? dto)
    {
        if (dto == null) return null;
        return new CashConfig
        {
            Amount = dto.Amount
        };
    }

    private static CashConfigDto? MapCashConfigDto(CashConfig? config)
    {
        if (config == null) return null;
        return new CashConfigDto
        {
            Amount = config.Amount
        };
    }

    private static PointsConfig? MapPointsConfig(PointsConfigDto? dto)
    {
        if (dto == null) return null;
        return new PointsConfig
        {
            Amount = dto.Amount
        };
    }

    private static PointsConfigDto? MapPointsConfigDto(PointsConfig? config)
    {
        if (config == null) return null;
        return new PointsConfigDto
        {
            Amount = config.Amount
        };
    }

    private static BonusCalculationRule? MapCalculationRule(BonusCalculationRuleDto? dto)
    {
        if (dto == null) return null;
        return new BonusCalculationRule
        {
            CalculationType = (Domain.ValueObjects.BonusCalculationType)dto.CalculationType,
            BasedOn = dto.BasedOn.HasValue
                ? (Domain.ValueObjects.BonusCalculationBasedOn)dto.BasedOn.Value
                : null,
            Formula = dto.Formula,
            FixedAmount = dto.FixedAmount,
            MinAmount = dto.MinAmount,
            MaxAmount = dto.MaxAmount,
            TieredCalculation = MapTieredCalculation(dto.TieredCalculation)
        };
    }

    private static BonusCalculationRuleDto? MapCalculationRuleDto(BonusCalculationRule? config)
    {
        if (config == null) return null;
        return new BonusCalculationRuleDto
        {
            CalculationType = (DTOs.BonusCalculationType)config.CalculationType,
            BasedOn = config.BasedOn.HasValue
                ? (DTOs.BonusCalculationBasedOn)config.BasedOn.Value
                : null,
            Formula = config.Formula,
            FixedAmount = config.FixedAmount,
            MinAmount = config.MinAmount,
            MaxAmount = config.MaxAmount,
            TieredCalculation = MapTieredCalculationDto(config.TieredCalculation)
        };
    }

    private static TieredCalculation? MapTieredCalculation(TieredCalculationDto? dto)
    {
        if (dto == null) return null;
        return new TieredCalculation
        {
            BasedOn = dto.BasedOn,
            Tiers = dto.Tiers.Select(t => new BonusTier
            {
                Id = t.Id,
                MinValue = t.MinValue,
                Percentage = t.Percentage,
                MaxBonus = t.MaxBonus
            }).ToList(),
            DefaultValue = dto.DefaultValue
        };
    }

    private static TieredCalculationDto? MapTieredCalculationDto(TieredCalculation? config)
    {
        if (config == null) return null;
        return new TieredCalculationDto
        {
            BasedOn = config.BasedOn,
            Tiers = config.Tiers.Select(t => new BonusTierDto
            {
                Id = t.Id,
                MinValue = t.MinValue,
                Percentage = t.Percentage,
                MaxBonus = t.MaxBonus
            }).ToList(),
            DefaultValue = config.DefaultValue
        };
    }

    private static BonusLimits? MapBonusLimits(BonusLimitsDto? dto)
    {
        if (dto == null) return null;
        return new BonusLimits
        {
            MaxTotalClaims = dto.MaxTotalClaims,
            MaxClaimsPerPlayer = dto.MaxClaimsPerPlayer,
            MaxClaimsPerPlayerPerDay = dto.MaxClaimsPerPlayerPerDay,
            MaxClaimsPerPlayerPerWeek = dto.MaxClaimsPerPlayerPerWeek,
            MaxClaimsPerPlayerPerMonth = dto.MaxClaimsPerPlayerPerMonth,
            MaxTotalValue = dto.MaxTotalValue
        };
    }

    private static BonusLimitsDto? MapBonusLimitsDto(BonusLimits? config)
    {
        if (config == null) return null;
        return new BonusLimitsDto
        {
            MaxTotalClaims = config.MaxTotalClaims,
            MaxClaimsPerPlayer = config.MaxClaimsPerPlayer,
            MaxClaimsPerPlayerPerDay = config.MaxClaimsPerPlayerPerDay,
            MaxClaimsPerPlayerPerWeek = config.MaxClaimsPerPlayerPerWeek,
            MaxClaimsPerPlayerPerMonth = config.MaxClaimsPerPlayerPerMonth,
            MaxTotalValue = config.MaxTotalValue
        };
    }

    #endregion
}
