using Facade.MessagingManagement.Contracts.DTOs;
using Facade.MessagingManagement.Contracts.Requests.Message;
using Facade.MessagingManagement.Contracts.Responses;
using Facade.MessagingManagement.Contracts.Services;
using Facade.Shared.Contracts.Pagination;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.MessagingManagement.Controllers.Controllers;

public class MessagingMessagesController : MessagingManagementControllerBase
{
    public MessagingMessagesController(IMessagingManagementService messagingManagementService)
        : base(messagingManagementService)
    {
    }

    [Authorize]
    [HttpPost("me/chats/{chatId:guid}/messages")]
    [ProducesResponseType(typeof(MessageResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> SendMessage(Guid chatId, [FromBody] SendMessageRequest request)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await MessagingService.SendMessageAsync(userId, chatId, request);
        if (!response.Success)
        {
            return MapMessageError(response);
        }

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me/chats/{chatId:guid}/messages")]
    [ProducesResponseType(typeof(PagedResponse<MessageDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetChatMessages(
        Guid chatId,
        [FromQuery] PagedRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var messages = await MessagingService.GetChatMessagesAsync(
            userId,
            chatId,
            request,
            cancellationToken);

        return Ok(messages);
    }

    [Authorize]
    [HttpGet("me/messages/{messageId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMessageById(Guid messageId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var item = await MessagingService.GetMessageByIdAsync(userId, messageId);
        if (item == null)
        {
            return NotFoundError(MessageNotFoundError);
        }

        return Ok(item);
    }

    [Authorize]
    [HttpPatch("me/messages/{messageId:guid}")]
    [ProducesResponseType(typeof(MessageResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> EditMessage(Guid messageId, [FromBody] EditMessageRequest request)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await MessagingService.EditMessageAsync(userId, messageId, request);
        if (!response.Success)
        {
            return MapMessageError(response);
        }

        return Ok(response);
    }

    [Authorize]
    [HttpDelete("me/messages/{messageId:guid}")]
    [ProducesResponseType(typeof(MessageResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteMessage(Guid messageId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await MessagingService.DeleteMessageAsync(userId, messageId);
        if (!response.Success)
        {
            return MapMessageError(response);
        }

        return Ok(response);
    }
}
