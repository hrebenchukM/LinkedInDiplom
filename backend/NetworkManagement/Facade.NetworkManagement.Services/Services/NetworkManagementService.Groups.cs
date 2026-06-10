using Facade.NetworkManagement.Contracts.DTOs;
using Facade.NetworkManagement.Contracts.Requests.Group;
using Facade.NetworkManagement.Contracts.Responses;
using Facade.FileStorage.Contracts;
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

    public async Task<UserGroupResponse> UploadGroupAvatarAsync(
        string userId,
        Guid groupId,
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        string avatarUrl;

        try
        {
            avatarUrl = await _fileStorageService.SaveAsync(
                fileStream,
                fileName,
                contentType,
                new FileStoragePathOptions
                {
                    ModuleName = "network",
                    EntityName = "group-avatar",
                    OwnerId = userId,
                    EntityId = groupId.ToString(),
                    AllowedExtensions = NetworkImageExtensions,
                    AllowedContentTypes = NetworkImageContentTypes
                },
                cancellationToken);
        }
        catch (InvalidOperationException ex)
        {
            return new UserGroupResponse
            {
                Success = false,
                Errors = new[] { ex.Message }
            };
        }

        var existingGroup = await GetMyUserGroupByIdAsync(userId, groupId);

        if (existingGroup == null)
        {
            return new UserGroupResponse
            {
                Success = false,
                Errors = new[] { "Group not found." }
            };
        }

        return await UpdateUserGroupAsync(
            userId,
            groupId,
            new UpdateUserGroupRequest
            {
                Name = existingGroup.Name,
                Description = existingGroup.Description,
                AvatarUrl = avatarUrl
            });
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
