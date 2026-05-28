using Facade.MessagingManagement.Contracts.Responses;
using Facade.MessagingManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.MessagingManagement.Controllers.Controllers;

public class MessagingChatMembersController : MessagingManagementControllerBase
{
    public MessagingChatMembersController(IMessagingManagementService messagingManagementService)
        : base(messagingManagementService)
    {
    }

    [Authorize]
    [HttpPost("me/chats/{chatId:guid}/join")]
    [ProducesResponseType(typeof(ChatMemberResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> JoinChat(Guid chatId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await MessagingService.JoinChatAsync(userId, chatId);
        if (!response.Success)
            return MapChatMemberError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpDelete("me/chats/{chatId:guid}/membership")]
    [ProducesResponseType(typeof(ChatMemberResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> LeaveChat(Guid chatId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await MessagingService.LeaveChatAsync(userId, chatId);
        if (!response.Success)
            return MapChatMemberError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me/chats/{chatId:guid}/members")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetChatMembers(Guid chatId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var members = await MessagingService.GetChatMembersAsync(userId, chatId);
        return Ok(members);
    }
}
