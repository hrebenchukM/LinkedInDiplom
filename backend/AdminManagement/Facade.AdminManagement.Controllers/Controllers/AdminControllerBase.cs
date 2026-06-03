using Microsoft.AspNetCore.Mvc;

namespace Facade.AdminManagement.Controllers.Controllers;

/// <summary>
/// Базовый controller Admin API: единый формат ошибок { success, errors }.
/// </summary>
public abstract class AdminControllerBase : ControllerBase
{
    protected IActionResult Error(string message, int statusCode)
    {
        return StatusCode(statusCode, new
        {
            success = false,
            errors = new[] { message }
        });
    }

    protected IActionResult BadRequestError(string message)
        => Error(message, 400);

    protected IActionResult NotFoundError(string message)
        => Error(message, 404);

    protected IActionResult MapInvalidOperationException(InvalidOperationException ex)
    {
        if (ex.Message.Contains("not found", StringComparison.OrdinalIgnoreCase)
            || ex.Message.Contains("was not found", StringComparison.OrdinalIgnoreCase))
        {
            return NotFoundError(ex.Message);
        }

        return BadRequestError(ex.Message);
    }
}
