using Facade.FileStorage.Contracts.Upload;
using Facade.ProfileManagement.Contracts.Responses;
using Facade.ProfileManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ProfileManagement.Controllers.Controllers;

public class ProfileMediaController : ProfileManagementControllerBase
{
    public ProfileMediaController(IProfileManagementService profileManagementService)
        : base(profileManagementService)
    {
    }

    // POST api/profile/me/avatar
    [Authorize]
    [HttpPost("me/avatar")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ProfileResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> UploadMyAvatar(IFormFile file)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var validationError = FileUploadValidation.Validate(
            file?.Length,
            FileUploadConstants.ImageMaxSizeBytes,
            FileUploadValidation.ImageTooLargeMessage);
        if (validationError != null)
            return MediaBadRequest(validationError);

        try
        {
            await using var stream = file!.OpenReadStream();

            var response = await ProfileService.UploadMyAvatarAsync(
                userId,
                stream,
                file.FileName,
                file.ContentType);

            if (!response.Success)
                return MapProfileError(response);

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return MediaBadRequest(ex.Message);
        }
    }

    // POST api/profile/me/header
    [Authorize]
    [HttpPost("me/header")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ProfileResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> UploadMyHeader(IFormFile file)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var validationError = FileUploadValidation.Validate(
            file?.Length,
            FileUploadConstants.ImageMaxSizeBytes,
            FileUploadValidation.ImageTooLargeMessage);
        if (validationError != null)
            return MediaBadRequest(validationError);

        try
        {
            await using var stream = file!.OpenReadStream();

            var response = await ProfileService.UploadMyHeaderAsync(
                userId,
                stream,
                file.FileName,
                file.ContentType);

            if (!response.Success)
                return MapProfileError(response);

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return MediaBadRequest(ex.Message);
        }
    }

    private static IActionResult MediaBadRequest(string message) =>
        new BadRequestObjectResult(new { success = false, errors = new[] { message } });
}
