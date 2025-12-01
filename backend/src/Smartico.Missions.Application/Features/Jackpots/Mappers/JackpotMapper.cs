using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Enums;
using BackOfficeJackpot = Smartico.BackOffice.Domain.Entities.Jackpot;
using BackOfficeJackpotType = Smartico.BackOffice.Domain.Entities.JackpotType;

namespace Smartico.Missions.Application.Features.Jackpots.Mappers;

/// <summary>
/// Maps BackOffice Jackpot entities to API DTO responses.
/// Converts MongoDB entities to player-facing jackpot details.
/// </summary>
public static class JackpotMapper
{
    /// <summary>
    /// Converts a BackOffice Jackpot entity to a JackpotDetails DTO.
    /// </summary>
    /// <param name="jackpot">The jackpot entity from MongoDB.</param>
    /// <param name="isOptedIn">Whether the current user is opted in.</param>
    /// <param name="registrationCount">Number of users opted in (for MultiUser jackpots).</param>
    /// <returns>The mapped JackpotDetails DTO.</returns>
    public static JackpotDetails ToDto(
        BackOfficeJackpot jackpot,
        bool isOptedIn = false,
        int registrationCount = 0)
    {
        // Get the primary tier (first tier or default values)
        var primaryTier = jackpot.Tiers.FirstOrDefault();
        var currentValue = primaryTier?.CurrentValue ?? 0m;
        var seedAmount = primaryTier?.SeedAmount ?? 0m;
        var maxValue = primaryTier?.MaxValue ?? 100000m;

        // Calculate temperature based on current value vs thresholds
        var temperature = CalculateTemperature(
            currentValue: currentValue,
            seedAmount: seedAmount,
            minAmount: seedAmount * 5, // Min threshold = 5x seed
            maxAmount: maxValue
        );

        // Map jackpot type from BackOffice enum to API enum
        var jackpotType = jackpot.Type == BackOfficeJackpotType.Progressive
            ? JackpotType.MultiUser
            : JackpotType.Personal;

        // Calculate contribution type from tier data
        var contributionRate = primaryTier?.ContributionRate ?? 0.05m;
        var contributionType = contributionRate < 1
            ? JackpotContributionType.Percentage
            : JackpotContributionType.Fixed;
        var contributionValue = contributionRate < 1
            ? contributionRate * 100 // Convert 0.05 to 5%
            : contributionRate;

        // Calculate explosion date (use end date or 7 days from now)
        var explosionDate = jackpot.EndDate ?? DateTime.UtcNow.AddDays(7);
        var exploseDateTs = new DateTimeOffset(explosionDate).ToUnixTimeMilliseconds();

        return new JackpotDetails
        {
            JpTemplateId = jackpot.Id.GetHashCode(), // Use hash as int ID for compatibility
            JpTypeId = jackpotType,
            JpCurrency = jackpot.Currency,
            UserCurrency = jackpot.Currency, // Same currency for demo
            ContributionType = contributionType,
            ContributionValue = contributionValue,
            Pot = new JackpotPot
            {
                JpPotId = jackpot.Id.GetHashCode() + 1000,
                JpTemplateId = jackpot.Id.GetHashCode(),
                CurrentPotAmount = currentValue,
                CurrentPotAmountUserCurrency = currentValue, // Same currency for demo
                CurrentPotTemperature = temperature,
                ExploseDateTs = exploseDateTs
            },
            RegistrationCount = jackpotType == JackpotType.Personal ? 1 : registrationCount,
            IsOptedIn = isOptedIn,
            AchRelatedGameAllowAll = jackpot.EligibleGames.Count == 0, // All games if no specific games set
            ExposeWinnersOverApi = true, // Always expose winners
            JpPublicMeta = new JackpotPublicMeta
            {
                Name = jackpot.Name,
                Description = jackpot.Description ?? $"Win big with {jackpot.Name}!",
                ImageUrl = $"https://images.example.com/jackpots/{jackpot.Id}.png",
                Placeholder1 = primaryTier?.TierName,
                Placeholder2 = null,
                CustomData = null
            },
            MinAmount = seedAmount * 5,
            MaxAmount = maxValue,
            SeedAmount = seedAmount
        };
    }

    /// <summary>
    /// Calculates the temperature (heat level) of a jackpot based on its current value.
    /// Temperature indicates proximity to explosion/win threshold.
    /// </summary>
    /// <param name="currentValue">Current pot value.</param>
    /// <param name="seedAmount">Initial seed amount.</param>
    /// <param name="minAmount">Minimum threshold for explosion eligibility.</param>
    /// <param name="maxAmount">Maximum value (guaranteed explosion).</param>
    /// <returns>The temperature level (COLD, WARM, HOT, BURNING).</returns>
    public static JackPotTemperature CalculateTemperature(
        decimal currentValue,
        decimal seedAmount,
        decimal minAmount,
        decimal maxAmount)
    {
        // Prevent division by zero
        if (maxAmount <= minAmount)
        {
            return currentValue >= minAmount ? JackPotTemperature.BURNING : JackPotTemperature.COLD;
        }

        var halfwayToMin = (minAmount - seedAmount) / 2 + seedAmount;
        var halfwayBetweenMinMax = minAmount + (maxAmount - minAmount) / 2;

        if (currentValue < halfwayToMin)
        {
            return JackPotTemperature.COLD;
        }
        else if (currentValue < minAmount)
        {
            return JackPotTemperature.WARM;
        }
        else if (currentValue < halfwayBetweenMinMax)
        {
            return JackPotTemperature.HOT;
        }
        else
        {
            return JackPotTemperature.BURNING;
        }
    }
}
