using MediatR;

namespace Smartico.Missions.Application.Features.Velocity.Commands.AcknowledgeLevelUp;

/// <summary>
/// Command to acknowledge a level-up event.
/// </summary>
/// <param name="UserId">Player's unique identifier</param>
/// <param name="EventId">Level-up event identifier</param>
public record AcknowledgeLevelUpCommand(string UserId, string EventId) : IRequest<AcknowledgeLevelUpResponse>;
