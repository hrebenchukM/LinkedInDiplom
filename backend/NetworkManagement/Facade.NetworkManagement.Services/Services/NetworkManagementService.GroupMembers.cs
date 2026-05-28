using Facade.NetworkManagement.Contracts.DTOs;
using Facade.NetworkManagement.Contracts.Responses;
using Network.Contracts.Parameters.GroupMember;

namespace Facade.NetworkManagement.Services.Services;

public partial class NetworkManagementService
{
    public async Task<GroupMemberResponse> JoinGroupAsync(string userId, Guid groupId)
    {
        var result = await _networkClient.GroupMembers.JoinAsync(new JoinGroupParameters
        {
            UserId = userId,
            GroupId = groupId
        });

        return MapGroupMemberResult(result);
    }

    public async Task<GroupMemberResponse> LeaveGroupAsync(string userId, Guid groupId)
    {
        var result = await _networkClient.GroupMembers.LeaveAsync(new LeaveGroupParameters
        {
            UserId = userId,
            GroupId = groupId
        });

        return MapGroupMemberResult(result);
    }

    public async Task<IReadOnlyCollection<GroupMemberDto>> GetGroupMembersAsync(string userId, Guid groupId)
    {
        var members = await _networkClient.GroupMembers.GetGroupMembersAsync(new GetGroupMembersParameters
        {
            UserId = userId,
            GroupId = groupId
        });

        return members.Select(MapGroupMemberToFacadeDto).ToList();
    }
}
