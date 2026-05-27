using System.Security.Claims;
using Facade.MessagingManagement.Contracts.Requests.Chat;
using Facade.MessagingManagement.Contracts.Requests.Message;
using Facade.MessagingManagement.Contracts.Requests.MessageMedia;
using Facade.MessagingManagement.Contracts.Responses;
using Facade.MessagingManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.MessagingManagement.Controllers.Controllers;

[ApiController]
[Route("api/messaging")]
public class MessagingController : ControllerBase
{
    private const string ChatNotFoundError = "Chat not found.";
    private const string ChatMembershipNotFoundError = "Chat membership not found.";
    private const string MessageNotFoundError = "Message not found.";
    private const string MessageMediaNotFoundError = "Message media not found.";

    private readonly IMessagingManagementService _messagingManagementService;

    public MessagingController(IMessagingManagementService messagingManagementService)
    {
        _messagingManagementService = messagingManagementService;
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

        var response = await _messagingManagementService.CreateChatAsync(userId, request);
        if (!response.Success)
            return BadRequest(response);

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

        var chats = await _messagingManagementService.GetMyChatsAsync(userId);
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

        var chat = await _messagingManagementService.GetChatByIdAsync(userId, chatId);
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

        var response = await _messagingManagementService.DeleteChatAsync(userId, chatId);
        if (!response.Success)
            return MapChatError(response);

        return Ok(response);
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

        var response = await _messagingManagementService.JoinChatAsync(userId, chatId);
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

        var response = await _messagingManagementService.LeaveChatAsync(userId, chatId);
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

        var members = await _messagingManagementService.GetChatMembersAsync(userId, chatId);
        return Ok(members);
    }

    [Authorize]
    [HttpPost("me/chats/{chatId:guid}/messages")]
    [ProducesResponseType(typeof(MessageResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> SendMessage(Guid chatId, [FromBody] SendMessageRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _messagingManagementService.SendMessageAsync(userId, chatId, request);
        if (!response.Success)
            return MapMessageError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me/chats/{chatId:guid}/messages")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetChatMessages(Guid chatId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var messages = await _messagingManagementService.GetChatMessagesAsync(userId, chatId);
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
            return Unauthorized();

        var message = await _messagingManagementService.GetMessageByIdAsync(userId, messageId);
        if (message == null)
            return NotFound();

        return Ok(message);
    }

    [Authorize]
    [HttpPatch("me/messages/{messageId:guid}")]
    [ProducesResponseType(typeof(MessageResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> EditMessage(Guid messageId, [FromBody] EditMessageRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _messagingManagementService.EditMessageAsync(userId, messageId, request);
        if (!response.Success)
            return MapMessageError(response);

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
            return Unauthorized();

        var response = await _messagingManagementService.DeleteMessageAsync(userId, messageId);
        if (!response.Success)
            return MapMessageError(response);

        return Ok(response);
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

        var response = await _messagingManagementService.MarkMessageReadAsync(userId, messageId);
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

        var reads = await _messagingManagementService.GetMessageReadsAsync(userId, messageId);
        return Ok(reads);
    }

    [Authorize]
    [HttpPost("me/messages/{messageId:guid}/media")]
    [ProducesResponseType(typeof(MessageMediaResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AttachMessageMedia(Guid messageId, [FromBody] AttachMessageMediaRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _messagingManagementService.AttachMessageMediaAsync(userId, messageId, request);
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

        var media = await _messagingManagementService.GetMessageMediaAsync(userId, messageId);
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

        var response = await _messagingManagementService.DeleteMessageMediaAsync(userId, messageId, messageMediaId);
        if (!response.Success)
            return MapMessageMediaError(response);

        return Ok(response);
    }

    private IActionResult MapChatError(ChatResponse response)
    {
        if (response.Errors.Contains(ChatNotFoundError))
            return NotFound(response);

        return BadRequest(response);
    }

    private IActionResult MapChatMemberError(ChatMemberResponse response)
    {
        if (response.Errors.Contains(ChatNotFoundError) ||
            response.Errors.Contains(ChatMembershipNotFoundError))
        {
            return NotFound(response);
        }

        return BadRequest(response);
    }

    private IActionResult MapMessageError(MessageResponse response)
    {
        if (response.Errors.Contains(ChatNotFoundError) ||
            response.Errors.Contains(MessageNotFoundError))
        {
            return NotFound(response);
        }

        return BadRequest(response);
    }

    private IActionResult MapMessageReadError(MessageReadResponse response)
    {
        if (response.Errors.Contains(MessageNotFoundError))
        {
            return NotFound(response);
        }

        return BadRequest(response);
    }

    private IActionResult MapMessageMediaError(MessageMediaResponse response)
    {
        if (response.Errors.Contains(MessageNotFoundError) ||
            response.Errors.Contains(MessageMediaNotFoundError))
        {
            return NotFound(response);
        }

        return BadRequest(response);
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
    }
}
