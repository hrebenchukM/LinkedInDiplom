using Facade.NotificationsManagement.Contracts.Requests.UserActivity;
using Facade.NotificationsManagement.Contracts.Responses;
using Facade.NotificationsManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.NotificationsManagement.Controllers.Controllers;

public class NotificationsUserActivityController : NotificationsManagementControllerBase
{
    public NotificationsUserActivityController(INotificationsManagementService notificationsManagementService)
        : base(notificationsManagementService)
    {
    }

    [Authorize]
    [HttpPost("me/activity")]
    [ProducesResponseType(typeof(UserActivityResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateUserActivity([FromBody] CreateUserActivityRequest request)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await NotificationsService.CreateUserActivityAsync(userId, request);
        if (!response.Success)
        {
            return BadRequest(new
            {
                success = false,
                errors = response.Errors ?? Array.Empty<string>()
            });
        }

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

        var activity = await NotificationsService.GetMyActivityAsync(userId, action, limit);
        return Ok(activity);
    }
}
