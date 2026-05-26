using Network.Client.Contracts.Resources;
using Network.Contracts.DTOs;
using Network.Contracts.Parameters.GroupMember;
using Network.Contracts.Results;
using Network.Contracts.Services;

namespace Network.Client.Resources;

// Реализация Resource для участников групп.
// Делегирует вызовы в IGroupMemberService.
public class GroupMemberResource : IGroupMemberResource
{
    private readonly IGroupMemberService _groupMemberService;

    public GroupMemberResource(IGroupMemberService groupMemberService)
    {
        _groupMemberService = groupMemberService;
    }

    public Task<GroupMemberResult> JoinAsync(JoinGroupParameters parameters)
    {
        return _groupMemberService.JoinAsync(parameters);
    }

    public Task<GroupMemberResult> LeaveAsync(LeaveGroupParameters parameters)
    {
        return _groupMemberService.LeaveAsync(parameters);
    }

    public Task<IReadOnlyCollection<GroupMemberDto>> GetGroupMembersAsync(
        GetGroupMembersParameters parameters)
    {
        return _groupMemberService.GetGroupMembersAsync(parameters);
    }
}
