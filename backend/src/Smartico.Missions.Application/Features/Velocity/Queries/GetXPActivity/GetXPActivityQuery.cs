using MediatR;
using Smartico.Missions.Application.Features.Velocity.DTOs;

namespace Smartico.Missions.Application.Features.Velocity.Queries.GetXPActivity;

/// <summary>
/// Query to retrieve recent XP-earning activities for a player.
/// </summary>
/// <param name="UserId">Player's unique identifier</param>
/// <param name="Limit">Maximum number of activities to return</param>
/// <param name="Type">Optional filter by activity type</param>
public record GetXPActivityQuery(string UserId, int Limit = 20, XpActivityType? Type = null) : IRequest<GetXPActivityResponse>;
