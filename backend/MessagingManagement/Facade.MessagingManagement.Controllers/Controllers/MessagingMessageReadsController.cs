using Facade.MessagingManagement.Contracts.Responses;
using Facade.MessagingManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.MessagingManagement.Controllers.Controllers;

public class MessagingMessageReadsController : MessagingManagementControllerBase
{
    public MessagingMessageReadsController(IMessagingManagementService messagingManagementService)
        : base(messagingManagementService)
    {
    }

    [Authorize]
    [HttpPost("me/messages/{messageId:guid}/read")]
    [ProducesResponseType(typeof(MessageReadResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> MarkMessageRead(Guid messageId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await MessagingService.MarkMessageReadAsync(userId, messageId);
        if (!response.Success)
            return MapMessageReadError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me/messages/{messageId:guid}/reads")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMessageReads(Guid messageId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var reads = await MessagingService.GetMessageReadsAsync(userId, messageId);
        return Ok(reads);
    }
}
