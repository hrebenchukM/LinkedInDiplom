using Messaging.Client.Contracts.Resources;
using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.ChatMember;
using Messaging.Contracts.Results;
using Messaging.Contracts.Services;

namespace Messaging.Client.Resources;

public class ChatMemberResource : IChatMemberResource
{
    private readonly IChatMemberService _chatMemberService;

    public ChatMemberResource(IChatMemberService chatMemberService)
    {
        _chatMemberService = chatMemberService;
    }

    public Task<ChatMemberResult> JoinAsync(JoinChatParameters parameters)
    {
        return _chatMemberService.JoinAsync(parameters);
    }

    public Task<ChatMemberResult> LeaveAsync(LeaveChatParameters parameters)
    {
        return _chatMemberService.LeaveAsync(parameters);
    }

    public Task<IReadOnlyCollection<ChatMemberDto>> GetChatMembersAsync(GetChatMembersParameters parameters)
    {
        return _chatMemberService.GetChatMembersAsync(parameters);
    }
}
