using System.Security.Claims;
using Facade.ProfileManagement.Contracts.Requests;
using Facade.ProfileManagement.Contracts.Responses;
using Facade.ProfileManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
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
}