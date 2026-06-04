using Network.Contracts.DTOs;
using Network.Contracts.Parameters.UserGroup;
using Network.Contracts.Results;

namespace Network.Contracts.Services;

// Интерфейс сервиса групп пользователей
public interface IUserGroupService
{
    Task<UserGroupResult> CreateAsync(CreateUserGroupParameters parameters);

    Task<IReadOnlyCollection<UserGroupDto>> GetMyGroupsAsync(GetMyUserGroupsParameters parameters);

    Task<UserGroupDto?> GetByIdAsync(GetUserGroupByIdParameters parameters);

    Task<UserGroupResult> UpdateAsync(UpdateUserGroupParameters parameters);

    Task<UserGroupResult> DeleteAsync(DeleteUserGroupParameters parameters);
}
