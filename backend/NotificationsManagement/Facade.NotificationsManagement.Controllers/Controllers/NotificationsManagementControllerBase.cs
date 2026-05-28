using System.Security.Claims;
using Facade.NotificationsManagement.Contracts.Responses;
using Facade.NotificationsManagement.Contracts.Services;
using Microsoft.AspNetCore.Mvc;

namespace Facade.NotificationsManagement.Controllers.Controllers;

[ApiController]
[Route("api/notifications")]
public abstract class NotificationsManagementControllerBase : ControllerBase
{
    protected const string NotificationNotFoundError = "Notification not found.";

    protected INotificationsManagementService NotificationsService { get; }

    protected NotificationsManagementControllerBase(INotificationsManagementService notificationsManagementService)
    {
        NotificationsService = notificationsManagementService;
    }

    private static readonly HashSet<string> NotificationNotFoundErrors = new(StringComparer.Ordinal)
    {
        NotificationNotFoundError
    };

    protected IActionResult MapNotificationError(NotificationResponse response) =>
        MapErrors(response, response.Errors, NotificationNotFoundErrors);

    protected string? GetCurrentUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub");

    protected IActionResult MapErrors<TResponse>(
        TResponse response,
        IEnumerable<string> errors,
        IReadOnlySet<string> notFoundErrors)
    {
        if (errors.Any(notFoundErrors.Contains))
            return new NotFoundObjectResult(response);

        return new BadRequestObjectResult(response);
    }
}
