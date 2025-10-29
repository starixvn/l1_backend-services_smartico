using Microsoft.AspNetCore.Mvc;

namespace Smartico.Missions.Api.Controllers;

/// <summary>
/// Health check controller for monitoring API availability.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ILogger<HealthController> _logger;

    public HealthController(ILogger<HealthController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Returns the health status of the API.
    /// </summary>
    /// <returns>Health status response</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetHealth()
    {
        _logger.LogInformation("Health check requested");

        return Ok(new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
            version = "1.0.0"
        });
    }
}

