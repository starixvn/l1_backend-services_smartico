using MediatR;
using Smartico.Missions.Domain.Entities;

namespace Smartico.Missions.Application.Features.Jackpots.Commands.OptIn;

/// <summary>
/// Command to opt a user into a jackpot.
/// </summary>
/// <param name="UserId">User identifier</param>
/// <param name="JackpotTemplateId">Jackpot template ID</param>
public record OptInJackpotCommand(string UserId, int JackpotTemplateId) : IRequest<OptInJackpotResponse>;

/// <summary>
/// Response after successful opt-in.
/// </summary>
/// <param name="Jackpot">Updated jackpot details with user opted in</param>
/// <param name="Message">Success message</param>
public record OptInJackpotResponse(JackpotDetails Jackpot, string Message);
