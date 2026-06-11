using Facade.NotificationsManagement.Contracts.DTOs;
using Facade.NotificationsManagement.Contracts.Requests.Notification;
using Facade.NotificationsManagement.Contracts.Responses;
using Facade.NotificationsManagement.Contracts.Services;
using Facade.Shared.Contracts.Pagination;
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
    [ProducesResponseType(typeof(PagedResponse<NotificationDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyNotifications(
        [FromQuery] GetMyNotificationsQueryRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        try
        {
            var notifications = await NotificationsService.GetMyNotificationsAsync(userId, request, cancellationToken);
            return Ok(notifications);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, errors = new[] { ex.Message } });
        }
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
        {
            return Unauthorized();
        }

        var item = await NotificationsService.GetNotificationByIdAsync(userId, notificationId);
        if (item is null)
        {
            return NotFoundError(NotificationNotFoundError);
        }

        return Ok(item);
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
        {
            return Unauthorized();
        }

        var response = await NotificationsService.MarkNotificationReadAsync(userId, notificationId);
        if (!response.Success)
        {
            return MapNotificationError(response);
        }

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
        {
            return Unauthorized();
        }

        var response = await NotificationsService.MarkAllNotificationsReadAsync(userId);
        if (!response.Success)
        {
            return MapNotificationError(response);
        }

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
        {
            return Unauthorized();
        }

        var response = await NotificationsService.DeleteNotificationAsync(userId, notificationId);
        if (!response.Success)
        {
            return MapNotificationError(response);
        }

        return Ok(response);
    }
}
