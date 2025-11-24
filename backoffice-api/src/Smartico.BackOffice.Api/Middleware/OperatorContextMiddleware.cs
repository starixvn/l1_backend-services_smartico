using MongoDB.Bson;
using System.Security.Claims;

namespace Smartico.BackOffice.Api.Middleware;

/// <summary>
/// Middleware that extracts the OperatorId from JWT claims and stores it in HttpContext.
/// This is critical for multi-tenant data isolation.
/// </summary>
public class OperatorContextMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<OperatorContextMiddleware> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="OperatorContextMiddleware"/> class.
    /// </summary>
    /// <param name="next">The next middleware in the pipeline.</param>
    /// <param name="logger">The logger instance.</param>
    public OperatorContextMiddleware(RequestDelegate next, ILogger<OperatorContextMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /// <summary>
    /// Processes the HTTP request and extracts OperatorId from claims.
    /// </summary>
    /// <param name="context">The HTTP context.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task InvokeAsync(HttpContext context)
    {
        // Extract operatorId from claims
        var operatorIdClaim = context.User.FindFirst("operatorId")?.Value
                            ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(operatorIdClaim))
        {
            _logger.LogWarning("No operatorId claim found in request. Path: {Path}", context.Request.Path);

            // For development/testing, allow requests without authentication
            // In production, this should return 401 Unauthorized
            if (!context.Request.Path.StartsWithSegments("/api/auth"))
            {
                // Use a default operator ID for development
                context.Items["OperatorId"] = ObjectId.Parse("000000000000000000000001");
                _logger.LogInformation("Using default OperatorId for development");
            }
        }
        else
        {
            // Parse and store the OperatorId
            if (ObjectId.TryParse(operatorIdClaim, out var operatorId))
            {
                context.Items["OperatorId"] = operatorId;
                _logger.LogDebug("OperatorId extracted from claims: {OperatorId}", operatorId);
            }
            else
            {
                _logger.LogError("Invalid OperatorId format: {OperatorIdClaim}", operatorIdClaim);
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { error = "Invalid operator ID format" });
                return;
            }
        }

        await _next(context);
    }
}

/// <summary>
/// Extension methods for registering the OperatorContextMiddleware.
/// </summary>
public static class OperatorContextMiddlewareExtensions
{
    /// <summary>
    /// Adds the OperatorContextMiddleware to the application pipeline.
    /// </summary>
    /// <param name="builder">The application builder.</param>
    /// <returns>The application builder.</returns>
    public static IApplicationBuilder UseOperatorContext(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<OperatorContextMiddleware>();
    }
}
