using Network.Contracts.DTOs;
using Network.Contracts.Parameters.GroupMember;
using Network.Contracts.Results;

namespace Network.Contracts.Services;

// Интерфейс сервиса участников групп
public interface IGroupMemberService
{
    Task<GroupMemberResult> JoinAsync(JoinGroupParameters parameters);

    Task<GroupMemberResult> LeaveAsync(LeaveGroupParameters parameters);

    Task<IReadOnlyCollection<GroupMemberDto>> GetGroupMembersAsync(GetGroupMembersParameters parameters);
}
