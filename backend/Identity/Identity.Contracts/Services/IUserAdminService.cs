using Identity.Contracts.DTOs;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;

namespace Identity.Contracts.Services;

public interface IUserAdminService
{
    Task<AdminUserListResult> GetUsersAsync(
        GetUsersParameters parameters,
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

    Task<IdentityStatsDto> GetIdentityStatsAsync(
        CancellationToken cancellationToken = default);
}
