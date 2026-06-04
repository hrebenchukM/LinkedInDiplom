using Facade.ProfileManagement.Contracts.Responses;
using Facade.ProfileManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ProfileManagement.Controllers.Controllers;

public class ProfileViewsController : ProfileManagementControllerBase
{
    public ProfileViewsController(IProfileManagementService profileManagementService)
        : base(profileManagementService)
    {
    }

    // POST api/profile/{profileOwnerId}/views
    [HttpPost("{profileOwnerId}/views")]
    [ProducesResponseType(typeof(ProfileViewResponse), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> RecordProfileView(
        string profileOwnerId,
        [FromQuery] string? source)
    {
        string? viewerUserId = null;

        if (User.Identity?.IsAuthenticated == true)
            viewerUserId = GetCurrentUserId();

        var viewerIp = HttpContext.Connection.RemoteIpAddress?.ToString();

        if (string.IsNullOrWhiteSpace(viewerIp))
            viewerIp = "unknown";

        var viewerUserAgent = Request.Headers.UserAgent.ToString();

        if (string.IsNullOrWhiteSpace(viewerUserAgent))
            viewerUserAgent = null;

        var response = await ProfileService.RecordProfileViewAsync(
            profileOwnerId,
            viewerUserId,
            viewerIp,
            viewerUserAgent,
            source);

        if (!response.Success)
            return MapProfileViewError(response);

        return Ok(response);
    }

    // GET api/profile/me/profile-views
    [Authorize]
    [HttpGet("me/profile-views")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyProfileViews()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var views = await ProfileService.GetMyProfileViewsAsync(userId);

        return Ok(views);
    }
}
