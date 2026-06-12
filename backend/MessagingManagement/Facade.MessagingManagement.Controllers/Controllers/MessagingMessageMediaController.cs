using Facade.FileStorage.Contracts.Upload;
using Facade.MessagingManagement.Contracts.Requests.MessageMedia;
using Facade.MessagingManagement.Contracts.Responses;
using Facade.MessagingManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Facade.MessagingManagement.Controllers.Controllers;

public class MessagingMessageMediaController : MessagingManagementControllerBase
{
    public MessagingMessageMediaController(IMessagingManagementService messagingManagementService)
        : base(messagingManagementService)
    {
    }

    [Authorize]
    [HttpPost("me/messages/{messageId:guid}/media")]
    [ProducesResponseType(typeof(MessageMediaResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AttachMessageMedia(Guid messageId, [FromBody] AttachMessageMediaRequest request)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await MessagingService.AttachMessageMediaAsync(userId, messageId, request);
        if (!response.Success)
            return MapMessageMediaError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpPost("me/messages/{messageId:guid}/media/upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(MessageMediaResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UploadMessageMedia(
        Guid messageId,
        IFormFile file,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var validationError = FileUploadValidation.Validate(
            file?.Length,
            FileUploadConstants.DocumentMaxSizeBytes,
            FileUploadValidation.DocumentTooLargeMessage);
        if (validationError != null)
            return MessageMediaBadRequest(validationError);

        await using var stream = file!.OpenReadStream();

        var response = await MessagingService.UploadMessageMediaAsync(
            userId,
            messageId,
            stream,
            file.FileName,
            file.ContentType,
            cancellationToken);

        if (!response.Success)
            return MapMessageMediaError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me/messages/{messageId:guid}/media")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMessageMedia(Guid messageId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var media = await MessagingService.GetMessageMediaAsync(userId, messageId);
        return Ok(media);
    }

    [Authorize]
    [HttpDelete("me/messages/{messageId:guid}/media/{messageMediaId:guid}")]
    [ProducesResponseType(typeof(MessageMediaResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteMessageMedia(Guid messageId, Guid messageMediaId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await MessagingService.DeleteMessageMediaAsync(userId, messageId, messageMediaId);
        if (!response.Success)
            return MapMessageMediaError(response);

        return Ok(response);
    }

    private static IActionResult MessageMediaBadRequest(string message) =>
        new BadRequestObjectResult(new { success = false, errors = new[] { message } });
}
