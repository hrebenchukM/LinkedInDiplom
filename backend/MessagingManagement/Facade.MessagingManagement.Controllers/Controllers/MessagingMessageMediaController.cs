using Facade.MessagingManagement.Contracts.Requests.MessageMedia;
using Facade.MessagingManagement.Contracts.Responses;
using Facade.MessagingManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
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
}
