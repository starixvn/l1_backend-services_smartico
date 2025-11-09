using MediatR;
using Smartico.Missions.Domain.Entities;

namespace Smartico.Missions.Application.Features.Jackpots.Queries.GetJackpots;

/// <summary>
/// Query to retrieve all active jackpots with user opt-in status.
/// </summary>
/// <param name="UserId">User identifier for opt-in status personalization</param>
public record GetJackpotsQuery(string UserId) : IRequest<GetJackpotsResponse>;

/// <summary>
/// Response containing list of jackpots with user opt-in status.
/// </summary>
/// <param name="Jackpots">List of active jackpots</param>
public record GetJackpotsResponse(List<JackpotDetails> Jackpots);
