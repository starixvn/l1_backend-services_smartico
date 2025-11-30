using MongoDB.Bson;
using Smartico.BackOffice.Application.Jackpots.Commands;
using Smartico.BackOffice.Application.Jackpots.DTOs;
using Smartico.BackOffice.Application.Jackpots.Interfaces;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Jackpots.Services;

/// <summary>
/// Service implementation for jackpot operations.
/// </summary>
public class JackpotService : IJackpotService
{
    private readonly IJackpotRepository _jackpotRepository;

    public JackpotService(IJackpotRepository jackpotRepository)
    {
        _jackpotRepository = jackpotRepository;
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<JackpotDto>> GetAllAsync(ObjectId operatorId)
    {
        var jackpots = await _jackpotRepository.GetAllAsync(operatorId);
        return jackpots.Select(MapToDto);
    }

    /// <inheritdoc/>
    public async Task<JackpotDto?> GetByIdAsync(string id, ObjectId operatorId)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return null;

        var jackpot = await _jackpotRepository.GetByIdAsync(objectId, operatorId);
        return jackpot != null ? MapToDto(jackpot) : null;
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<JackpotDto>> GetActiveAsync(ObjectId operatorId)
    {
        var jackpots = await _jackpotRepository.GetActiveAsync(operatorId);
        return jackpots.Select(MapToDto);
    }

    /// <inheritdoc/>
    public async Task<JackpotDto> CreateAsync(CreateJackpotCommand command, ObjectId operatorId, ObjectId? userId = null)
    {
        var jackpot = new Jackpot
        {
            OperatorId = operatorId,
            Name = command.Name,
            Description = command.Description,
            Type = command.Type,
            Status = JackpotStatus.Draft,
            Tiers = command.Tiers.Select(MapFromTierDto).ToList(),
            EligibleGames = command.EligibleGames,
            PrizeDistribution = MapFromPrizeDistributionDto(command.PrizeDistribution),
            ResetBehavior = command.ResetBehavior,
            Currency = command.Currency,
            StartDate = command.StartDate,
            EndDate = command.EndDate,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Initialize current values to seed amounts
        foreach (var tier in jackpot.Tiers)
        {
            tier.CurrentValue = tier.SeedAmount;
        }

        var created = await _jackpotRepository.CreateAsync(jackpot);
        return MapToDto(created);
    }

    /// <inheritdoc/>
    public async Task<JackpotDto?> UpdateAsync(string id, UpdateJackpotCommand command, ObjectId operatorId)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return null;

        var existing = await _jackpotRepository.GetByIdAsync(objectId, operatorId);
        if (existing == null)
            return null;

        // Only allow updates to Draft jackpots
        if (existing.Status != JackpotStatus.Draft)
            return null;

        existing.Name = command.Name;
        existing.Description = command.Description;
        existing.Type = command.Type;
        existing.Tiers = command.Tiers.Select(MapFromTierDto).ToList();
        existing.EligibleGames = command.EligibleGames;
        existing.PrizeDistribution = MapFromPrizeDistributionDto(command.PrizeDistribution);
        existing.ResetBehavior = command.ResetBehavior;
        existing.Currency = command.Currency;
        existing.StartDate = command.StartDate;
        existing.EndDate = command.EndDate;
        existing.UpdatedAt = DateTime.UtcNow;

        // Initialize current values to seed amounts for new/updated tiers
        foreach (var tier in existing.Tiers)
        {
            tier.CurrentValue = tier.SeedAmount;
        }

        await _jackpotRepository.UpdateAsync(existing);
        return MapToDto(existing);
    }

    /// <inheritdoc/>
    public async Task<bool> ActivateAsync(string id, ObjectId operatorId)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return false;

        var jackpot = await _jackpotRepository.GetByIdAsync(objectId, operatorId);
        if (jackpot == null || jackpot.Status != JackpotStatus.Draft)
            return false;

        jackpot.Status = JackpotStatus.Active;
        jackpot.UpdatedAt = DateTime.UtcNow;

        return await _jackpotRepository.UpdateAsync(jackpot);
    }

    /// <inheritdoc/>
    public async Task<bool> PauseAsync(string id, ObjectId operatorId)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return false;

        var jackpot = await _jackpotRepository.GetByIdAsync(objectId, operatorId);
        if (jackpot == null || jackpot.Status != JackpotStatus.Active)
            return false;

        jackpot.Status = JackpotStatus.Paused;
        jackpot.UpdatedAt = DateTime.UtcNow;

        return await _jackpotRepository.UpdateAsync(jackpot);
    }

    /// <inheritdoc/>
    public async Task<bool> ResumeAsync(string id, ObjectId operatorId)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return false;

        var jackpot = await _jackpotRepository.GetByIdAsync(objectId, operatorId);
        if (jackpot == null || jackpot.Status != JackpotStatus.Paused)
            return false;

        jackpot.Status = JackpotStatus.Active;
        jackpot.UpdatedAt = DateTime.UtcNow;

        return await _jackpotRepository.UpdateAsync(jackpot);
    }

    /// <inheritdoc/>
    public async Task<bool> ArchiveAsync(string id, ObjectId operatorId)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return false;

        var jackpot = await _jackpotRepository.GetByIdAsync(objectId, operatorId);
        if (jackpot == null)
            return false;

        jackpot.Status = JackpotStatus.Archived;
        jackpot.UpdatedAt = DateTime.UtcNow;

        return await _jackpotRepository.UpdateAsync(jackpot);
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteAsync(string id, ObjectId operatorId)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return false;

        // Only allow deletion of draft jackpots
        var jackpot = await _jackpotRepository.GetByIdAsync(objectId, operatorId);
        if (jackpot == null || jackpot.Status != JackpotStatus.Draft)
            return false;

        return await _jackpotRepository.DeleteAsync(objectId, operatorId);
    }

    #region Mapping Helpers

    private static JackpotDto MapToDto(Jackpot jackpot)
    {
        return new JackpotDto
        {
            Id = jackpot.Id.ToString(),
            OperatorId = jackpot.OperatorId.ToString(),
            Name = jackpot.Name,
            Description = jackpot.Description,
            Type = jackpot.Type,
            Status = jackpot.Status,
            Tiers = jackpot.Tiers.Select(MapToTierDto).ToList(),
            EligibleGames = jackpot.EligibleGames,
            PrizeDistribution = MapToPrizeDistributionDto(jackpot.PrizeDistribution),
            ResetBehavior = jackpot.ResetBehavior,
            Currency = jackpot.Currency,
            StartDate = jackpot.StartDate,
            EndDate = jackpot.EndDate,
            TotalContributions = jackpot.TotalContributions,
            TotalPayouts = jackpot.TotalPayouts,
            LastWonAt = jackpot.LastWonAt,
            LastWinnerPlayerId = jackpot.LastWinnerPlayerId,
            LastWinAmount = jackpot.LastWinAmount,
            CreatedAt = jackpot.CreatedAt,
            UpdatedAt = jackpot.UpdatedAt
        };
    }

    private static JackpotTierDto MapToTierDto(JackpotTier tier)
    {
        return new JackpotTierDto
        {
            TierId = tier.TierId,
            TierName = tier.TierName,
            SeedAmount = tier.SeedAmount,
            ContributionRate = tier.ContributionRate,
            MaxValue = tier.MaxValue,
            CurrentValue = tier.CurrentValue,
            TriggerCondition = MapToTriggerConditionDto(tier.TriggerCondition),
            DisplayOrder = tier.DisplayOrder
        };
    }

    private static JackpotTier MapFromTierDto(JackpotTierDto dto)
    {
        return new JackpotTier
        {
            TierId = string.IsNullOrEmpty(dto.TierId) ? Guid.NewGuid().ToString() : dto.TierId,
            TierName = dto.TierName,
            SeedAmount = dto.SeedAmount,
            ContributionRate = dto.ContributionRate,
            MaxValue = dto.MaxValue,
            CurrentValue = dto.CurrentValue,
            TriggerCondition = MapFromTriggerConditionDto(dto.TriggerCondition),
            DisplayOrder = dto.DisplayOrder
        };
    }

    private static JackpotTriggerConditionDto MapToTriggerConditionDto(JackpotTriggerCondition condition)
    {
        return new JackpotTriggerConditionDto
        {
            TriggerType = condition.TriggerType,
            Probability = condition.Probability,
            BetThreshold = condition.BetThreshold,
            TimeInterval = condition.TimeInterval,
            TimeOfDay = condition.TimeOfDay,
            TriggerAmount = condition.TriggerAmount
        };
    }

    private static JackpotTriggerCondition MapFromTriggerConditionDto(JackpotTriggerConditionDto dto)
    {
        return new JackpotTriggerCondition
        {
            TriggerType = dto.TriggerType,
            Probability = dto.Probability,
            BetThreshold = dto.BetThreshold,
            TimeInterval = dto.TimeInterval,
            TimeOfDay = dto.TimeOfDay,
            TriggerAmount = dto.TriggerAmount
        };
    }

    private static JackpotPrizeDistributionDto MapToPrizeDistributionDto(JackpotPrizeDistribution distribution)
    {
        return new JackpotPrizeDistributionDto
        {
            DistributionType = distribution.DistributionType,
            MaxWinners = distribution.MaxWinners,
            WinnerPercentages = distribution.WinnerPercentages,
            MinimumWagerToQualify = distribution.MinimumWagerToQualify,
            MaxPercentagePerPlayer = distribution.MaxPercentagePerPlayer
        };
    }

    private static JackpotPrizeDistribution MapFromPrizeDistributionDto(JackpotPrizeDistributionDto dto)
    {
        return new JackpotPrizeDistribution
        {
            DistributionType = dto.DistributionType,
            MaxWinners = dto.MaxWinners,
            WinnerPercentages = dto.WinnerPercentages,
            MinimumWagerToQualify = dto.MinimumWagerToQualify,
            MaxPercentagePerPlayer = dto.MaxPercentagePerPlayer
        };
    }

    #endregion
}
