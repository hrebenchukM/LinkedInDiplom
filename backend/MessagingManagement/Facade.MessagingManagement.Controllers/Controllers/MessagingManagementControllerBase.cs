using System.Security.Claims;
using Facade.MessagingManagement.Contracts.Responses;
using Facade.MessagingManagement.Contracts.Services;
using Microsoft.AspNetCore.Mvc;

namespace Facade.MessagingManagement.Controllers.Controllers;

[ApiController]
[Route("api/messaging")]
/// <summary>
/// Базовый controller facade-слоя Messaging.
/// Нужен для единообразной HTTP-обработки ошибок и получения пользователя из JWT claims.
/// </summary>
public abstract class MessagingManagementControllerBase : ControllerBase
{
    protected const string ChatNotFoundError = "Chat not found.";
    protected const string ChatMembershipNotFoundError = "Chat membership not found.";
    protected const string MessageNotFoundError = "Message not found.";
    protected const string MessageMediaNotFoundError = "Message media not found.";

    protected IMessagingManagementService MessagingService { get; }

    protected MessagingManagementControllerBase(IMessagingManagementService messagingManagementService)
    {
        MessagingService = messagingManagementService;
    }

    private static readonly HashSet<string> ChatNotFoundErrors = new(StringComparer.Ordinal)
    {
        ChatNotFoundError
    };

    private static readonly HashSet<string> ChatMemberNotFoundErrors = new(StringComparer.Ordinal)
    {
        ChatNotFoundError,
        ChatMembershipNotFoundError
    };

    private static readonly HashSet<string> MessageNotFoundErrors = new(StringComparer.Ordinal)
    {
        ChatNotFoundError,
        MessageNotFoundError
    };

    private static readonly HashSet<string> MessageReadNotFoundErrors = new(StringComparer.Ordinal)
    {
        MessageNotFoundError
    };

    private static readonly HashSet<string> MessageMediaNotFoundErrors = new(StringComparer.Ordinal)
    {
        MessageNotFoundError,
        MessageMediaNotFoundError
    };

    protected IActionResult MapChatError(ChatResponse response) =>
        MapErrors(response, response.Errors, ChatNotFoundErrors);

    protected IActionResult MapChatMemberError(ChatMemberResponse response) =>
        MapErrors(response, response.Errors, ChatMemberNotFoundErrors);

    protected IActionResult MapMessageError(MessageResponse response) =>
        MapErrors(response, response.Errors, MessageNotFoundErrors);

    protected IActionResult MapMessageReadError(MessageReadResponse response) =>
        MapErrors(response, response.Errors, MessageReadNotFoundErrors);

    protected IActionResult MapMessageMediaError(MessageMediaResponse response) =>
        MapErrors(response, response.Errors, MessageMediaNotFoundErrors);

    protected string? GetCurrentUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub");

    protected IActionResult MapErrors<TResponse>(
        TResponse response,
        IEnumerable<string> errors,
        IReadOnlySet<string> notFoundErrors)
    {
        if (errors.Any(notFoundErrors.Contains))
            return new NotFoundObjectResult(response);

        return new BadRequestObjectResult(response);
    }
}
