using Facade.MessagingManagement.Contracts.DTOs;
using Facade.MessagingManagement.Contracts.Responses;
using Messaging.Contracts.Parameters.ChatMember;

namespace Facade.MessagingManagement.Services.Services;

public partial class MessagingManagementService
{
    public async Task<ChatMemberResponse> JoinChatAsync(string userId, Guid chatId)
    {
        var result = await _messagingClient.ChatMembers.JoinAsync(new JoinChatParameters
        {
            UserId = userId,
            ChatId = chatId,
            Folder = null
        });

        return MapChatMemberResult(result);
    }

    public async Task<ChatMemberResponse> LeaveChatAsync(string userId, Guid chatId)
    {
        var result = await _messagingClient.ChatMembers.LeaveAsync(new LeaveChatParameters
        {
            UserId = userId,
            ChatId = chatId
        });

        return MapChatMemberResult(result);
    }

    public async Task<IReadOnlyCollection<ChatMemberDto>> GetChatMembersAsync(string userId, Guid chatId)
    {
        var members = await _messagingClient.ChatMembers.GetChatMembersAsync(new GetChatMembersParameters
        {
            UserId = userId,
            ChatId = chatId
        });

        return members.Select(MapChatMemberToFacadeDto).ToList();
    }
}
