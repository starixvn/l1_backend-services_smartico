namespace Smartico.Missions.Application.Features.Velocity.Commands.AcknowledgeLevelUp;

/// <summary>
/// Response for acknowledge level-up command.
/// </summary>
/// <param name="Success">Whether the acknowledgment was successful</param>
/// <param name="Error">Error message if failed</param>
public record AcknowledgeLevelUpResponse(bool Success, string? Error = null);
