using System.Security.Claims;
using Facade.MessagingManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Facade.MessagingManagement.Controllers.Hubs;

[Authorize]
public class MessagingHub : Hub
{
    private readonly IMessagingManagementService _messagingManagementService;

    public MessagingHub(IMessagingManagementService messagingManagementService)
    {
        _messagingManagementService = messagingManagementService;
    }

    public async Task JoinChat(Guid chatId)
    {
        var userId = GetCurrentUserId();

        var chat = await _messagingManagementService.GetChatByIdAsync(userId, chatId);
        if (chat is null)
        {
            throw new HubException("Chat not found.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, GetChatGroupName(chatId));
    }

    public async Task LeaveChat(Guid chatId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetChatGroupName(chatId));
    }

    private string GetCurrentUserId()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? Context.User?.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new HubException("User id claim not found.");
        }

        return userId;
    }

    public static string GetChatGroupName(Guid chatId) => $"chat:{chatId}";
}
