using Identity.Contracts.DTOs;

namespace Identity.Contracts.Services;

public interface IRoleService
{
    Task<IReadOnlyCollection<RoleDto>> GetRolesAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<string>> GetUserRolesAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task AddUserToRoleAsync(
        string userId,
        string roleName,
        CancellationToken cancellationToken = default);

    Task RemoveUserFromRoleAsync(
        string userId,
        string roleName,
        CancellationToken cancellationToken = default);
}
