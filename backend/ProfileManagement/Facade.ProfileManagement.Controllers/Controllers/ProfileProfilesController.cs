using Facade.ProfileManagement.Contracts.Requests;
using Facade.ProfileManagement.Contracts.Responses;
using Facade.ProfileManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ProfileManagement.Controllers.Controllers;

public class ProfileProfilesController : ProfileManagementControllerBase
{
    public ProfileProfilesController(IProfileManagementService profileManagementService)
        : base(profileManagementService)
    {
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

        var profile = await ProfileService.GetMyProfileAsync(userId);

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

        var response = await ProfileService.UpdateMyProfileAsync(userId, request);

        if (!response.Success)
            return MapProfileError(response);

        return Ok(response);
    }

    // GET api/profile/{userId}
    [HttpGet("{userId}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetProfileByUserId(string userId)
    {
        var profile = await ProfileService.GetProfileByUserIdAsync(userId);

        if (profile == null)
            return NotFound();

        return Ok(profile);
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

        var response = await ProfileService.PatchMyProfileAsync(userId, request);

        if (!response.Success)
            return MapProfileError(response);

        return Ok(response);
    }
}
