using System.Security.Claims;
using Facade.ProfileManagement.Contracts.Requests;
using Facade.ProfileManagement.Contracts.Requests.MessageSettings;
using Facade.ProfileManagement.Contracts.Responses;
using Facade.ProfileManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ProfileManagement.Controllers.Controllers;

[ApiController]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private readonly IProfileManagementService _profileManagementService;

    public ProfileController(IProfileManagementService profileManagementService)
    {
        _profileManagementService = profileManagementService;
    }

    // GET api/profile/me
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var profile = await _profileManagementService.GetMyProfileAsync(userId);

        if (profile == null)
            return NotFound();

        return Ok(profile);
    }

    // PUT api/profile/me
    [Authorize]
    [HttpPut("me")]
    [ProducesResponseType(typeof(ProfileResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateMyProfileRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _profileManagementService.UpdateMyProfileAsync(userId, request);

        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
    }

    // GET api/profile/{userId}
    [HttpGet("{userId}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetProfileByUserId(string userId)
    {
        var profile = await _profileManagementService.GetProfileByUserIdAsync(userId);

        if (profile == null)
            return NotFound();

        return Ok(profile);
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
    }

    // PATCH api/profile/me
    [Authorize]
    [HttpPatch("me")]
    [ProducesResponseType(typeof(ProfileResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> PatchMyProfile([FromBody] PatchMyProfileRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _profileManagementService.PatchMyProfileAsync(userId, request);

        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
    }

    // POST api/profile/me/avatar
    [Authorize]
    [HttpPost("me/avatar")]
    [ProducesResponseType(typeof(ProfileResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> UploadMyAvatar(IFormFile file)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        if (file == null || file.Length == 0)
            return BadRequest("File is empty.");
        if (file.Length > 5 * 1024 * 1024)
            return BadRequest("File is too large. Maximum size is 5 MB.");

        try
        {
            await using var stream = file.OpenReadStream();

            var response = await _profileManagementService.UploadMyAvatarAsync(
                userId,
                stream,
                file.FileName,
                file.ContentType);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // POST api/profile/me/header
    [Authorize]
    [HttpPost("me/header")]
    [ProducesResponseType(typeof(ProfileResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> UploadMyHeader(IFormFile file)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        if (file == null || file.Length == 0)
            return BadRequest("File is empty.");
        if (file.Length > 5 * 1024 * 1024)
            return BadRequest("File is too large. Maximum size is 5 MB.");

        try
        {
            await using var stream = file.OpenReadStream();

            var response = await _profileManagementService.UploadMyHeaderAsync(
                userId,
                stream,
                file.FileName,
                file.ContentType);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // GET api/profile/me/message-settings
    [Authorize]
    [HttpGet("me/message-settings")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyMessageSettings()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var settings = await _profileManagementService.GetMyMessageSettingsAsync(userId);

        return Ok(settings);
    }

    // PUT api/profile/me/message-settings
    [Authorize]
    [HttpPut("me/message-settings")]
    [ProducesResponseType(typeof(MessageSettingsResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> UpdateMyMessageSettings(
        [FromBody] UpdateMessageSettingsRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _profileManagementService.UpdateMyMessageSettingsAsync(userId, request);

        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
    }

    // PATCH api/profile/me/message-settings
    [Authorize]
    [HttpPatch("me/message-settings")]
    [ProducesResponseType(typeof(MessageSettingsResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> PatchMyMessageSettings(
        [FromBody] PatchMessageSettingsRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _profileManagementService.PatchMyMessageSettingsAsync(userId, request);

        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
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

        var response = await _profileManagementService.RecordProfileViewAsync(
            profileOwnerId,
            viewerUserId,
            viewerIp,
            viewerUserAgent,
            source);

        if (!response.Success)
            return NotFound(response);

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

        var views = await _profileManagementService.GetMyProfileViewsAsync(userId);

        return Ok(views);
    }
}