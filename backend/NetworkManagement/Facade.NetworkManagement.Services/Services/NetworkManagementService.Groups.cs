using Facade.NetworkManagement.Contracts.DTOs;
using Facade.NetworkManagement.Contracts.Requests.Group;
using Facade.NetworkManagement.Contracts.Responses;
using Network.Contracts.Parameters.UserGroup;

namespace Facade.NetworkManagement.Services.Services;

public partial class NetworkManagementService
{
    public async Task<UserGroupResponse> CreateUserGroupAsync(string userId, CreateUserGroupRequest request)
    {
        var result = await _networkClient.UserGroups.CreateAsync(new CreateUserGroupParameters
        {
            OwnerId = userId,
            Name = request.Name,
            Description = request.Description,
            AvatarUrl = request.AvatarUrl
        });

        return MapUserGroupResult(result);
    }

    public async Task<IReadOnlyCollection<UserGroupDto>> GetMyUserGroupsAsync(string userId)
    {
        var groups = await _networkClient.UserGroups.GetMyGroupsAsync(new GetMyUserGroupsParameters
        {
            UserId = userId
        });

        return groups.Select(MapUserGroupToFacadeDto).ToList();
    }

    public async Task<UserGroupDto?> GetMyUserGroupByIdAsync(string userId, Guid groupId)
    {
        var group = await _networkClient.UserGroups.GetByIdAsync(new GetUserGroupByIdParameters
        {
            UserId = userId,
            GroupId = groupId
        });

        return group == null ? null : MapUserGroupToFacadeDto(group);
    }

    public async Task<UserGroupResponse> UpdateUserGroupAsync(
        string userId,
        Guid groupId,
        UpdateUserGroupRequest request)
    {
        var result = await _networkClient.UserGroups.UpdateAsync(new UpdateUserGroupParameters
        {
            OwnerId = userId,
            GroupId = groupId,
            Name = request.Name,
            Description = request.Description,
            AvatarUrl = request.AvatarUrl
        });

        return MapUserGroupResult(result);
    }

    public async Task<UserGroupResponse> DeleteUserGroupAsync(string userId, Guid groupId)
    {
        var result = await _networkClient.UserGroups.DeleteAsync(new DeleteUserGroupParameters
        {
            OwnerId = userId,
            GroupId = groupId
        });

        return MapUserGroupResult(result);
    }
}
