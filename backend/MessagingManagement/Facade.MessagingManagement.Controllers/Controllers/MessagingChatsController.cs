using Facade.MessagingManagement.Contracts.Requests.Chat;
using Facade.MessagingManagement.Contracts.Responses;
using Facade.MessagingManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.MessagingManagement.Controllers.Controllers;

public class MessagingChatsController : MessagingManagementControllerBase
{
    public MessagingChatsController(IMessagingManagementService messagingManagementService)
        : base(messagingManagementService)
    {
    }

    [Authorize]
    [HttpPost("me/chats")]
    [ProducesResponseType(typeof(ChatResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateChat([FromBody] CreateChatRequest? request)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await MessagingService.CreateChatAsync(userId, request);
        if (!response.Success)
            return MapChatError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me/chats")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyChats()
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var chats = await MessagingService.GetMyChatsAsync(userId);
        return Ok(chats);
    }

    [Authorize]
    [HttpGet("me/chats/{chatId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetChatById(Guid chatId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var chat = await MessagingService.GetChatByIdAsync(userId, chatId);
        if (chat == null)
            return NotFound();

        return Ok(chat);
    }

    [Authorize]
    [HttpDelete("me/chats/{chatId:guid}")]
    [ProducesResponseType(typeof(ChatResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteChat(Guid chatId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await MessagingService.DeleteChatAsync(userId, chatId);
        if (!response.Success)
            return MapChatError(response);

        return Ok(response);
    }
}
