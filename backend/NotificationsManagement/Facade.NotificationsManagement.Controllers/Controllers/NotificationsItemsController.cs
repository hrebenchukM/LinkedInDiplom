using Facade.NotificationsManagement.Contracts.Responses;
using Facade.NotificationsManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.NotificationsManagement.Controllers.Controllers;

public class NotificationsItemsController : NotificationsManagementControllerBase
{
    public NotificationsItemsController(INotificationsManagementService notificationsManagementService)
        : base(notificationsManagementService)
    {
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyNotifications([FromQuery] bool? isRead, [FromQuery] int? limit)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var notifications = await NotificationsService.GetMyNotificationsAsync(userId, isRead, limit);
        return Ok(notifications);
    }

    [Authorize]
    [HttpGet("me/{notificationId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetNotificationById(Guid notificationId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var notification = await NotificationsService.GetNotificationByIdAsync(userId, notificationId);
        if (notification is null)
            return NotFound();

        return Ok(notification);
    }

    [Authorize]
    [HttpPatch("me/{notificationId:guid}/read")]
    [ProducesResponseType(typeof(NotificationResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> MarkNotificationRead(Guid notificationId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NotificationsService.MarkNotificationReadAsync(userId, notificationId);
        if (!response.Success)
            return MapNotificationError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpPatch("me/read-all")]
    [ProducesResponseType(typeof(NotificationResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> MarkAllNotificationsRead()
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NotificationsService.MarkAllNotificationsReadAsync(userId);
        if (!response.Success)
            return MapNotificationError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpDelete("me/{notificationId:guid}")]
    [ProducesResponseType(typeof(NotificationResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteNotification(Guid notificationId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NotificationsService.DeleteNotificationAsync(userId, notificationId);
        if (!response.Success)
            return MapNotificationError(response);

        return Ok(response);
    }
}
