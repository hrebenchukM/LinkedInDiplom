using Facade.ProfileManagement.Contracts.Requests;
using Facade.ProfileManagement.Contracts.Responses;
using Facade.ProfileManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ProfileManagement.Controllers.Controllers;

/// <summary>
/// Facade-контроллер для чтения и обновления профиля пользователя.
/// Здесь только HTTP-слой и orchestration-вызов ProfileManagementService.
/// </summary>
public class ProfileProfilesController : ProfileManagementControllerBase
{
    public ProfileProfilesController(IProfileManagementService profileManagementService)
        : base(profileManagementService)
    {
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyProfile()
    {
        // В защищённых endpoint-ах пользователь определяется из JWT.
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        // Если профиль не найден, API возвращает 404 вместо пустого объекта.
        var item = await ProfileService.GetMyProfileAsync(userId);

        if (item == null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [Authorize]
    [HttpPut("me")]
    [ProducesResponseType(typeof(ProfileResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateMyProfileRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await ProfileService.UpdateMyProfileAsync(userId, request);

        if (!response.Success)
        {
            return MapProfileError(response);
        }

        return Ok(response);
    }

    [HttpGet("{userId}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetProfileByUserId(string userId)
    {
        var item = await ProfileService.GetProfileByUserIdAsync(userId);

        if (item == null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [Authorize]
    [HttpPatch("me")]
    [ProducesResponseType(typeof(ProfileResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> PatchMyProfile([FromBody] PatchMyProfileRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await ProfileService.PatchMyProfileAsync(userId, request);

        if (!response.Success)
        {
            return MapProfileError(response);
        }

        return Ok(response);
    }
}
