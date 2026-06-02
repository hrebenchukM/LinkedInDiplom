using Identity.Contracts.DTOs;

namespace Facade.AdminManagement.Contracts.Services;

public interface IAdminManagementService
{
    Task<IReadOnlyCollection<AdminUserDto>> GetUsersAsync(
        CancellationToken cancellationToken = default);

    Task<AdminUserDto> GetUserByIdAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task LockUserAsync(
        string userId,
        DateTimeOffset? lockoutEnd = null,
        CancellationToken cancellationToken = default);

    Task UnlockUserAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task SoftDeleteUserAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<RoleDto>> GetRolesAsync(
        CancellationToken cancellationToken = default);

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
