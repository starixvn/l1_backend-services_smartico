using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Smartico.Missions.Api.Filters;

/// <summary>
/// Action filter to validate model state before controller action execution.
/// Returns 400 Bad Request with validation errors if model state is invalid.
/// </summary>
public class ValidateModelFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (!context.ModelState.IsValid)
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .Select(e => new
                {
                    field = e.Key,
                    errors = e.Value?.Errors.Select(x => x.ErrorMessage).ToArray()
                })
                .ToArray();

            context.Result = new BadRequestObjectResult(new
            {
                success = false,
                error = new
                {
                    message = "Validation failed",
                    statusCode = 400,
                    timestamp = DateTime.UtcNow,
                    errors
                }
            });
        }
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        // No action needed after execution
    }
}

