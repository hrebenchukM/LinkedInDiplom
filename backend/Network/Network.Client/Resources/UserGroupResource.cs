using Network.Client.Contracts.Resources;
using Network.Contracts.DTOs;
using Network.Contracts.Parameters.UserGroup;
using Network.Contracts.Results;
using Network.Contracts.Services;

namespace Network.Client.Resources;

// Реализация Resource для групп.
// Делегирует вызовы в IUserGroupService.
public class UserGroupResource : IUserGroupResource
{
    private readonly IUserGroupService _userGroupService;

    public UserGroupResource(IUserGroupService userGroupService)
    {
        _userGroupService = userGroupService;
    }

    public Task<UserGroupResult> CreateAsync(CreateUserGroupParameters parameters)
    {
        return _userGroupService.CreateAsync(parameters);
    }

    public Task<IReadOnlyCollection<UserGroupDto>> GetMyGroupsAsync(GetMyUserGroupsParameters parameters)
    {
        return _userGroupService.GetMyGroupsAsync(parameters);
    }

    public Task<UserGroupDto?> GetByIdAsync(GetUserGroupByIdParameters parameters)
    {
        return _userGroupService.GetByIdAsync(parameters);
    }

    public Task<UserGroupResult> UpdateAsync(UpdateUserGroupParameters parameters)
    {
        return _userGroupService.UpdateAsync(parameters);
    }

    public Task<UserGroupResult> DeleteAsync(DeleteUserGroupParameters parameters)
    {
        return _userGroupService.DeleteAsync(parameters);
    }
}
