using Facade.ProfileManagement.Contracts.Requests.MessageSettings;
using Facade.ProfileManagement.Contracts.Responses;
using Facade.ProfileManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ProfileManagement.Controllers.Controllers;

public class ProfileMessageSettingsController : ProfileManagementControllerBase
{
    public ProfileMessageSettingsController(IProfileManagementService profileManagementService)
        : base(profileManagementService)
    {
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

        var settings = await ProfileService.GetMyMessageSettingsAsync(userId);

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

        var response = await ProfileService.UpdateMyMessageSettingsAsync(userId, request);

        if (!response.Success)
            return MapMessageSettingsError(response);

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

        var response = await ProfileService.PatchMyMessageSettingsAsync(userId, request);

        if (!response.Success)
            return MapMessageSettingsError(response);

        return Ok(response);
    }
}
