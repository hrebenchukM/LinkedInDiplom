using Facade.FileStorage.Contracts.Upload;
using Facade.ContentManagement.Contracts.Requests.Media;
using Facade.ContentManagement.Contracts.Responses;
using Facade.ContentManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ContentManagement.Controllers.Controllers;

public class ContentMediaController : ContentManagementControllerBase
{
    public ContentMediaController(IContentManagementService contentManagementService)
        : base(contentManagementService)
    {
    }

    // POST api/content/me/media
    [Authorize]
    [HttpPost("me/media")]
    [ProducesResponseType(typeof(MediaResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateMedia([FromBody] CreateMediaRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ContentService.CreateMediaAsync(request);

        if (!response.Success)
            return MapMediaError(response);

        return Ok(response);
    }

    // POST api/content/me/media/upload
    [Authorize]
    [HttpPost("me/media/upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(MediaResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> UploadMedia(IFormFile file, CancellationToken cancellationToken)
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

        await using var stream = file!.OpenReadStream();

        var response = await ContentService.UploadMediaAsync(
            userId,
            stream,
            file.FileName,
            file.ContentType,
            cancellationToken);

        if (!response.Success)
            return MapMediaError(response);

        return Ok(response);
    }

    // GET api/content/media/{mediaId}
    [Authorize]
    [HttpGet("media/{mediaId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMediaById(Guid mediaId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var media = await ContentService.GetMediaByIdAsync(mediaId);

        if (media == null)
            return NotFoundError(MediaNotFoundError);

        return Ok(media);
    }

    private static IActionResult MediaBadRequest(string message) =>
        new BadRequestObjectResult(new { success = false, errors = new[] { message } });
}
