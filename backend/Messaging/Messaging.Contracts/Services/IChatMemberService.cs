using Messaging.Contracts.DTOs;
using Messaging.Contracts.Parameters.ChatMember;
using Messaging.Contracts.Results;

namespace Messaging.Contracts.Services;

public interface IChatMemberService
{
    Task<ChatMemberResult> JoinAsync(JoinChatParameters parameters);
    Task<ChatMemberResult> LeaveAsync(LeaveChatParameters parameters);
    Task<IReadOnlyCollection<ChatMemberDto>> GetChatMembersAsync(GetChatMembersParameters parameters);
}
