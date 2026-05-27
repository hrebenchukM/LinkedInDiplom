using System.Security.Claims;
using Facade.NotificationsManagement.Contracts.Requests.UserActivity;
using Facade.NotificationsManagement.Contracts.Responses;
using Facade.NotificationsManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.NotificationsManagement.Controllers.Controllers;

[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private const string NotificationNotFoundError = "Notification not found.";
    private readonly INotificationsManagementService _notificationsManagementService;

    public NotificationsController(INotificationsManagementService notificationsManagementService)
    {
        _notificationsManagementService = notificationsManagementService;
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

        var notifications = await _notificationsManagementService.GetMyNotificationsAsync(userId, isRead, limit);
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

        var notification = await _notificationsManagementService.GetNotificationByIdAsync(userId, notificationId);
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

        var response = await _notificationsManagementService.MarkNotificationReadAsync(userId, notificationId);
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

        var response = await _notificationsManagementService.MarkAllNotificationsReadAsync(userId);
        if (!response.Success)
            return BadRequest(response);

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

        var response = await _notificationsManagementService.DeleteNotificationAsync(userId, notificationId);
        if (!response.Success)
            return MapNotificationError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpPost("me/activity")]
    [ProducesResponseType(typeof(UserActivityResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateUserActivity([FromBody] CreateUserActivityRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _notificationsManagementService.CreateUserActivityAsync(userId, request);
        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me/activity")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyActivity([FromQuery] string? action, [FromQuery] int? limit)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var activity = await _notificationsManagementService.GetMyActivityAsync(userId, action, limit);
        return Ok(activity);
    }

    private IActionResult MapNotificationError(NotificationResponse response)
    {
        if (response.Errors.Contains(NotificationNotFoundError))
            return NotFound(response);

        return BadRequest(response);
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
    }
}
