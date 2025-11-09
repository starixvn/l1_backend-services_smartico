namespace Smartico.Missions.Domain.Enums;

/// <summary>
/// Represents the "heat level" of a jackpot pool, indicating proximity to explosion.
/// Temperature is calculated based on current pool amount vs min/max thresholds.
/// </summary>
public enum JackPotTemperature
{
    /// <summary>
    /// Pool is very small, growing slowly.
    /// Calculated as: current_pot &lt; (min_amount - seed_amount) / 2
    /// Visual: Blue color, snowflake icon.
    /// </summary>
    COLD = 0,

    /// <summary>
    /// Pool is halfway to explosion threshold.
    /// Calculated as: (min_amount - seed_amount) / 2 ≤ current_pot &lt; min_amount
    /// Visual: Yellow color, sun icon.
    /// </summary>
    WARM = 1,

    /// <summary>
    /// Pool in explosion range, approaching max.
    /// Calculated as: min_amount ≤ current_pot &lt; min_amount + 0.5 * (max_amount - min_amount)
    /// Visual: Orange color, fire icon.
    /// </summary>
    HOT = 2,

    /// <summary>
    /// Pool very hot, explosion imminent.
    /// Calculated as: current_pot ≥ min_amount + 0.5 * (max_amount - min_amount)
    /// Visual: Red color, volcano icon with pulse animation.
    /// </summary>
    BURNING = 3
}
