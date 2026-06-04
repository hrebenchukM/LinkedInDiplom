using Identity.Client.Contracts.Resources;
using Identity.Contracts.DTOs;
using Facade.AdminManagement.Contracts.Services;

namespace Facade.AdminManagement.Services.Services;

public class AdminManagementService : IAdminManagementService
{
    private readonly IUserResource _userResource;

    public AdminManagementService(IUserResource userResource)
    {
        _userResource = userResource;
    }

    public Task<IReadOnlyCollection<AdminUserDto>> GetUsersAsync(
        CancellationToken cancellationToken = default)
        => _userResource.GetUsersAsync(cancellationToken);

    public Task<AdminUserDto> GetUserByIdAsync(
        string userId,
        CancellationToken cancellationToken = default)
        => _userResource.GetUserByIdAsync(userId, cancellationToken);

    public Task LockUserAsync(
        string userId,
        DateTimeOffset? lockoutEnd = null,
        CancellationToken cancellationToken = default)
        => _userResource.LockUserAsync(userId, lockoutEnd, cancellationToken);

    public Task UnlockUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
        => _userResource.UnlockUserAsync(userId, cancellationToken);

    public Task SoftDeleteUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
        => _userResource.SoftDeleteUserAsync(userId, cancellationToken);

    public Task<IReadOnlyCollection<RoleDto>> GetRolesAsync(
        CancellationToken cancellationToken = default)
        => _userResource.GetRolesAsync(cancellationToken);

    public Task<IReadOnlyCollection<string>> GetUserRolesAsync(
        string userId,
        CancellationToken cancellationToken = default)
        => _userResource.GetUserRolesAsync(userId, cancellationToken);

    public Task AddUserToRoleAsync(
        string userId,
        string roleName,
        CancellationToken cancellationToken = default)
        => _userResource.AddUserToRoleAsync(userId, roleName, cancellationToken);

    public Task RemoveUserFromRoleAsync(
        string userId,
        string roleName,
        CancellationToken cancellationToken = default)
        => _userResource.RemoveUserFromRoleAsync(userId, roleName, cancellationToken);
}
