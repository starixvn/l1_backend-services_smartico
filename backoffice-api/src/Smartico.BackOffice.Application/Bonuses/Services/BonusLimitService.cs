using MongoDB.Bson;
using Smartico.BackOffice.Domain.Repositories;
using Smartico.BackOffice.Domain.Services;

namespace Smartico.BackOffice.Application.Bonuses.Services;

/// <summary>
/// Service for checking and enforcing bonus limits.
/// Validates both per-bonus limits and global operator limits before allowing claims.
/// </summary>
public class BonusLimitService : IBonusLimitService
{
    private readonly IBonusRepository _bonusRepository;
    private readonly IBonusClaimRepository _claimRepository;
    private readonly IOperatorBonusLimitsRepository _operatorLimitsRepository;

    public BonusLimitService(
        IBonusRepository bonusRepository,
        IBonusClaimRepository claimRepository,
        IOperatorBonusLimitsRepository operatorLimitsRepository)
    {
        _bonusRepository = bonusRepository;
        _claimRepository = claimRepository;
        _operatorLimitsRepository = operatorLimitsRepository;
    }

    /// <inheritdoc/>
    public async Task<BonusClaimCheckResult> CheckPlayerCanClaimAsync(
        ObjectId operatorId,
        string playerId,
        ObjectId bonusId,
        decimal claimValue,
        string currency,
        CancellationToken cancellationToken = default)
    {
        // Get bonus template
        var bonus = await _bonusRepository.GetByIdAsync(operatorId, bonusId, cancellationToken);
        if (bonus == null)
        {
            return BonusClaimCheckResult.Rejected("Bonus not found.");
        }

        if (bonus.Status != Domain.Entities.BonusStatus.Active)
        {
            return BonusClaimCheckResult.Rejected($"Bonus is not active. Current status: {bonus.Status}");
        }

        // Check bonus schedule
        var now = DateTime.UtcNow;
        if (now < bonus.StartDate || now > bonus.EndDate)
        {
            return BonusClaimCheckResult.Rejected("Bonus is not within its active period.");
        }

        // Get date ranges for limit checks
        var todayStart = DateTime.UtcNow.Date;
        var todayEnd = todayStart.AddDays(1);
        var weekStart = GetStartOfWeek(todayStart);
        var weekEnd = weekStart.AddDays(7);
        var monthStart = new DateTime(todayStart.Year, todayStart.Month, 1);
        var monthEnd = monthStart.AddMonths(1);

        // Check per-bonus limits
        if (bonus.Limits != null)
        {
            // Check MaxTotalClaims
            if (bonus.Limits.MaxTotalClaims.HasValue)
            {
                var totalClaims = await _claimRepository.GetTotalClaimCountAsync(operatorId, bonusId, cancellationToken);
                if (totalClaims >= bonus.Limits.MaxTotalClaims.Value)
                {
                    return BonusClaimCheckResult.Rejected(
                        "Bonus has reached maximum total claims.",
                        BonusLimitType.BonusMaxTotalClaims,
                        bonus.Limits.MaxTotalClaims.Value,
                        totalClaims);
                }
            }

            // Check MaxClaimsPerPlayer
            if (bonus.Limits.MaxClaimsPerPlayer.HasValue)
            {
                var playerClaims = await _claimRepository.GetPlayerClaimCountAsync(operatorId, bonusId, playerId, cancellationToken);
                if (playerClaims >= bonus.Limits.MaxClaimsPerPlayer.Value)
                {
                    return BonusClaimCheckResult.Rejected(
                        "You have reached the maximum claims for this bonus.",
                        BonusLimitType.BonusMaxClaimsPerPlayer,
                        bonus.Limits.MaxClaimsPerPlayer.Value,
                        playerClaims);
                }
            }

            // Check MaxClaimsPerPlayerPerDay
            if (bonus.Limits.MaxClaimsPerPlayerPerDay.HasValue)
            {
                var dailyClaims = await _claimRepository.GetPlayerClaimCountInRangeAsync(
                    operatorId, bonusId, playerId, todayStart, todayEnd, cancellationToken);
                if (dailyClaims >= bonus.Limits.MaxClaimsPerPlayerPerDay.Value)
                {
                    return BonusClaimCheckResult.Rejected(
                        "You have reached the daily limit for this bonus.",
                        BonusLimitType.BonusMaxClaimsPerPlayerPerDay,
                        bonus.Limits.MaxClaimsPerPlayerPerDay.Value,
                        dailyClaims);
                }
            }

            // Check MaxClaimsPerPlayerPerWeek
            if (bonus.Limits.MaxClaimsPerPlayerPerWeek.HasValue)
            {
                var weeklyClaims = await _claimRepository.GetPlayerClaimCountInRangeAsync(
                    operatorId, bonusId, playerId, weekStart, weekEnd, cancellationToken);
                if (weeklyClaims >= bonus.Limits.MaxClaimsPerPlayerPerWeek.Value)
                {
                    return BonusClaimCheckResult.Rejected(
                        "You have reached the weekly limit for this bonus.",
                        BonusLimitType.BonusMaxClaimsPerPlayerPerWeek,
                        bonus.Limits.MaxClaimsPerPlayerPerWeek.Value,
                        weeklyClaims);
                }
            }

            // Check MaxClaimsPerPlayerPerMonth
            if (bonus.Limits.MaxClaimsPerPlayerPerMonth.HasValue)
            {
                var monthlyClaims = await _claimRepository.GetPlayerClaimCountInRangeAsync(
                    operatorId, bonusId, playerId, monthStart, monthEnd, cancellationToken);
                if (monthlyClaims >= bonus.Limits.MaxClaimsPerPlayerPerMonth.Value)
                {
                    return BonusClaimCheckResult.Rejected(
                        "You have reached the monthly limit for this bonus.",
                        BonusLimitType.BonusMaxClaimsPerPlayerPerMonth,
                        bonus.Limits.MaxClaimsPerPlayerPerMonth.Value,
                        monthlyClaims);
                }
            }

            // Check MaxTotalValue
            if (bonus.Limits.MaxTotalValue.HasValue)
            {
                var totalValue = await _claimRepository.GetTotalClaimValueAsync(operatorId, bonusId, cancellationToken);
                if (totalValue + claimValue > bonus.Limits.MaxTotalValue.Value)
                {
                    return BonusClaimCheckResult.Rejected(
                        "Bonus has reached maximum total value distribution.",
                        BonusLimitType.BonusMaxTotalValue,
                        bonus.Limits.MaxTotalValue.Value,
                        totalValue);
                }
            }
        }

        // Check global operator limits
        var operatorLimits = await _operatorLimitsRepository.GetByOperatorIdAsync(operatorId, cancellationToken);
        if (operatorLimits != null && operatorLimits.Currency == currency)
        {
            // Check MaxDailyBonusValuePerPlayer
            if (operatorLimits.MaxDailyBonusValuePerPlayer.HasValue)
            {
                var dailyTotal = await _claimRepository.GetPlayerTotalClaimValueInRangeAsync(
                    operatorId, playerId, currency, todayStart, todayEnd, cancellationToken);
                if (dailyTotal + claimValue > operatorLimits.MaxDailyBonusValuePerPlayer.Value)
                {
                    return BonusClaimCheckResult.Rejected(
                        "You have reached your daily bonus limit.",
                        BonusLimitType.GlobalMaxDailyValuePerPlayer,
                        operatorLimits.MaxDailyBonusValuePerPlayer.Value,
                        dailyTotal);
                }
            }

            // Check MaxWeeklyBonusValuePerPlayer
            if (operatorLimits.MaxWeeklyBonusValuePerPlayer.HasValue)
            {
                var weeklyTotal = await _claimRepository.GetPlayerTotalClaimValueInRangeAsync(
                    operatorId, playerId, currency, weekStart, weekEnd, cancellationToken);
                if (weeklyTotal + claimValue > operatorLimits.MaxWeeklyBonusValuePerPlayer.Value)
                {
                    return BonusClaimCheckResult.Rejected(
                        "You have reached your weekly bonus limit.",
                        BonusLimitType.GlobalMaxWeeklyValuePerPlayer,
                        operatorLimits.MaxWeeklyBonusValuePerPlayer.Value,
                        weeklyTotal);
                }
            }

            // Check MaxMonthlyBonusValuePerPlayer
            if (operatorLimits.MaxMonthlyBonusValuePerPlayer.HasValue)
            {
                var monthlyTotal = await _claimRepository.GetPlayerTotalClaimValueInRangeAsync(
                    operatorId, playerId, currency, monthStart, monthEnd, cancellationToken);
                if (monthlyTotal + claimValue > operatorLimits.MaxMonthlyBonusValuePerPlayer.Value)
                {
                    return BonusClaimCheckResult.Rejected(
                        "You have reached your monthly bonus limit.",
                        BonusLimitType.GlobalMaxMonthlyValuePerPlayer,
                        operatorLimits.MaxMonthlyBonusValuePerPlayer.Value,
                        monthlyTotal);
                }
            }
        }

        return BonusClaimCheckResult.Allowed();
    }

    /// <inheritdoc/>
    public async Task<decimal> GetPlayerDailyTotalAsync(
        ObjectId operatorId,
        string playerId,
        string currency,
        CancellationToken cancellationToken = default)
    {
        var todayStart = DateTime.UtcNow.Date;
        var todayEnd = todayStart.AddDays(1);

        return await _claimRepository.GetPlayerTotalClaimValueInRangeAsync(
            operatorId, playerId, currency, todayStart, todayEnd, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<decimal> GetPlayerWeeklyTotalAsync(
        ObjectId operatorId,
        string playerId,
        string currency,
        CancellationToken cancellationToken = default)
    {
        var todayStart = DateTime.UtcNow.Date;
        var weekStart = GetStartOfWeek(todayStart);
        var weekEnd = weekStart.AddDays(7);

        return await _claimRepository.GetPlayerTotalClaimValueInRangeAsync(
            operatorId, playerId, currency, weekStart, weekEnd, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<decimal> GetPlayerMonthlyTotalAsync(
        ObjectId operatorId,
        string playerId,
        string currency,
        CancellationToken cancellationToken = default)
    {
        var todayStart = DateTime.UtcNow.Date;
        var monthStart = new DateTime(todayStart.Year, todayStart.Month, 1);
        var monthEnd = monthStart.AddMonths(1);

        return await _claimRepository.GetPlayerTotalClaimValueInRangeAsync(
            operatorId, playerId, currency, monthStart, monthEnd, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<decimal?> GetPlayerRemainingDailyLimitAsync(
        ObjectId operatorId,
        string playerId,
        string currency,
        CancellationToken cancellationToken = default)
    {
        var operatorLimits = await _operatorLimitsRepository.GetByOperatorIdAsync(operatorId, cancellationToken);
        if (operatorLimits?.MaxDailyBonusValuePerPlayer == null || operatorLimits.Currency != currency)
        {
            return null;
        }

        var dailyTotal = await GetPlayerDailyTotalAsync(operatorId, playerId, currency, cancellationToken);
        return Math.Max(0, operatorLimits.MaxDailyBonusValuePerPlayer.Value - dailyTotal);
    }

    /// <inheritdoc/>
    public async Task<decimal?> GetPlayerRemainingWeeklyLimitAsync(
        ObjectId operatorId,
        string playerId,
        string currency,
        CancellationToken cancellationToken = default)
    {
        var operatorLimits = await _operatorLimitsRepository.GetByOperatorIdAsync(operatorId, cancellationToken);
        if (operatorLimits?.MaxWeeklyBonusValuePerPlayer == null || operatorLimits.Currency != currency)
        {
            return null;
        }

        var weeklyTotal = await GetPlayerWeeklyTotalAsync(operatorId, playerId, currency, cancellationToken);
        return Math.Max(0, operatorLimits.MaxWeeklyBonusValuePerPlayer.Value - weeklyTotal);
    }

    /// <inheritdoc/>
    public async Task<decimal?> GetPlayerRemainingMonthlyLimitAsync(
        ObjectId operatorId,
        string playerId,
        string currency,
        CancellationToken cancellationToken = default)
    {
        var operatorLimits = await _operatorLimitsRepository.GetByOperatorIdAsync(operatorId, cancellationToken);
        if (operatorLimits?.MaxMonthlyBonusValuePerPlayer == null || operatorLimits.Currency != currency)
        {
            return null;
        }

        var monthlyTotal = await GetPlayerMonthlyTotalAsync(operatorId, playerId, currency, cancellationToken);
        return Math.Max(0, operatorLimits.MaxMonthlyBonusValuePerPlayer.Value - monthlyTotal);
    }

    /// <summary>
    /// Gets the start of the week (Monday) for a given date.
    /// </summary>
    private static DateTime GetStartOfWeek(DateTime date)
    {
        var diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
        return date.AddDays(-1 * diff);
    }
}
