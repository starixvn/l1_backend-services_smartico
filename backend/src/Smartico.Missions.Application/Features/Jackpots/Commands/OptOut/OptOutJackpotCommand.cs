using MediatR;
using Smartico.Missions.Domain.Entities;

namespace Smartico.Missions.Application.Features.Jackpots.Commands.OptOut;

/// <summary>
/// Command to opt a user out of a jackpot.
/// </summary>
/// <param name="UserId">User identifier</param>
/// <param name="JackpotTemplateId">Jackpot template ID</param>
public record OptOutJackpotCommand(string UserId, int JackpotTemplateId) : IRequest<OptOutJackpotResponse>;

/// <summary>
/// Response after successful opt-out.
/// </summary>
/// <param name="Jackpot">Updated jackpot details with user opted out</param>
/// <param name="Message">Success message</param>
public record OptOutJackpotResponse(JackpotDetails Jackpot, string Message);
