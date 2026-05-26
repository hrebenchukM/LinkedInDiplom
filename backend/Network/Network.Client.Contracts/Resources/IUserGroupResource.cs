using Network.Contracts.DTOs;
using Network.Contracts.Parameters.UserGroup;
using Network.Contracts.Results;

namespace Network.Client.Contracts.Resources;

// Resource для работы с группами Network-модуля.
// Внутренняя точка доступа фасада к группам.
public interface IUserGroupResource
{
    Task<UserGroupResult> CreateAsync(CreateUserGroupParameters parameters);

    Task<IReadOnlyCollection<UserGroupDto>> GetMyGroupsAsync(GetMyUserGroupsParameters parameters);

    Task<UserGroupDto?> GetByIdAsync(GetUserGroupByIdParameters parameters);

    Task<UserGroupResult> UpdateAsync(UpdateUserGroupParameters parameters);

    Task<UserGroupResult> DeleteAsync(DeleteUserGroupParameters parameters);
}
