using Identity.Contracts.DTOs;
using Identity.Contracts.Parameters;
using Identity.Contracts.Results;
using Identity.Contracts.Services;
using Identity.DataAccess;
using Identity.DataAccess.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Identity.Services.Services;

public class UserAdminService : IUserAdminService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IdentityDbContext _dbContext;
    private readonly IAuthenticationService _authenticationService;

    public UserAdminService(
        UserManager<ApplicationUser> userManager,
        IdentityDbContext dbContext,
        IAuthenticationService authenticationService)
    {
        _userManager = userManager;
        _dbContext = dbContext;
        _authenticationService = authenticationService;
    }

    public async Task<AdminUserListResult> GetUsersAsync(
        GetUsersParameters parameters,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(parameters.Email))
        {
            var emailPattern = $"%{parameters.Email.Trim()}%";
            query = query.Where(u =>
                u.Email != null && EF.Functions.ILike(u.Email, emailPattern));
        }

        if (parameters.IsDeleted == true)
        {
            query = query.Where(u => u.DeletedAt != null);
        }
        else if (parameters.IsDeleted == false)
        {
            query = query.Where(u => u.DeletedAt == null);
        }

        var utcNow = DateTimeOffset.UtcNow;
        if (parameters.IsLocked == true)
        {
            query = query.Where(u => u.LockoutEnd != null && u.LockoutEnd > utcNow);
        }
        else if (parameters.IsLocked == false)
        {
            query = query.Where(u => u.LockoutEnd == null || u.LockoutEnd <= utcNow);
        }

        if (!string.IsNullOrWhiteSpace(parameters.Role))
        {
            var normalizedRoleName = parameters.Role.Trim().ToUpperInvariant();
            var roleExists = await _dbContext.Roles
                .AsNoTracking()
                .AnyAsync(r => r.NormalizedName == normalizedRoleName, cancellationToken);

            if (!roleExists)
            {
                return new AdminUserListResult
                {
                    Items = Array.Empty<AdminUserDto>(),
                    TotalCount = 0
                };
            }

            query = query.Where(u =>
                _dbContext.UserRoles.Any(ur =>
                    ur.UserId == u.Id &&
                    _dbContext.Roles.Any(r =>
                        r.Id == ur.RoleId &&
                        r.NormalizedName == normalizedRoleName)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var sortBy = string.IsNullOrWhiteSpace(parameters.SortBy)
            ? "createdAt"
            : parameters.SortBy.Trim();
        var descending = !string.Equals(parameters.SortDirection, "asc", StringComparison.OrdinalIgnoreCase);

        query = ApplySorting(query, sortBy, descending);

        var users = await query
            .Skip(parameters.Skip)
            .Take(parameters.Take)
            .ToListAsync(cancellationToken);

        var result = new List<AdminUserDto>(users.Count);
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            result.Add(MapToAdminUserDto(user, roles));
        }

        return new AdminUserListResult
        {
            Items = result,
            TotalCount = totalCount
        };
    }

    private static IQueryable<ApplicationUser> ApplySorting(
        IQueryable<ApplicationUser> query,
        string sortBy,
        bool descending)
    {
        return sortBy.ToLowerInvariant() switch
        {
            "email" when descending => query.OrderByDescending(u => u.Email),
            "email" => query.OrderBy(u => u.Email),
            "username" when descending => query.OrderByDescending(u => u.UserName),
            "username" => query.OrderBy(u => u.UserName),
            "updatedat" when descending => query.OrderByDescending(u => u.UpdatedAt),
            "updatedat" => query.OrderBy(u => u.UpdatedAt),
            "createdat" when descending => query.OrderByDescending(u => u.CreatedAt),
            "createdat" => query.OrderBy(u => u.CreatedAt),
            _ when descending => query.OrderByDescending(u => u.CreatedAt),
            _ => query.OrderBy(u => u.CreatedAt)
        };
    }

    public async Task<AdminUserDto> GetUserByIdAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
        {
            throw new InvalidOperationException($"User with id '{userId}' was not found.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        return MapToAdminUserDto(user, roles);
    }

    public async Task LockUserAsync(
        string userId,
        DateTimeOffset? lockoutEnd = null,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException($"User with id '{userId}' was not found.");
        }

        var lockoutEnabledResult = await _userManager.SetLockoutEnabledAsync(user, true);
        EnsureSucceeded(lockoutEnabledResult, $"Failed to enable lockout for user '{userId}'");

        var lockoutEndValue = lockoutEnd ?? DateTimeOffset.UtcNow.AddYears(100);
        var lockoutResult = await _userManager.SetLockoutEndDateAsync(user, lockoutEndValue);
        EnsureSucceeded(lockoutResult, $"Failed to lock user '{userId}'");

        user.UpdatedAt = DateTime.UtcNow;
        var updateResult = await _userManager.UpdateAsync(user);
        EnsureSucceeded(updateResult, $"Failed to update user '{userId}' lock metadata");

        // TODO: revoke active refresh tokens on lock.
        await _authenticationService.RevokeAllUserTokensAsync(userId);
    }

    public async Task UnlockUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException($"User with id '{userId}' was not found.");
        }

        var unlockResult = await _userManager.SetLockoutEndDateAsync(user, null);
        EnsureSucceeded(unlockResult, $"Failed to unlock user '{userId}'");

        var resetFailsResult = await _userManager.ResetAccessFailedCountAsync(user);
        EnsureSucceeded(resetFailsResult, $"Failed to reset access failed count for user '{userId}'");

        user.UpdatedAt = DateTime.UtcNow;
        var updateResult = await _userManager.UpdateAsync(user);
        EnsureSucceeded(updateResult, $"Failed to update user '{userId}' unlock metadata");
    }

    public async Task SoftDeleteUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException($"User with id '{userId}' was not found.");
        }

        if (user.DeletedAt != null)
        {
            return;
        }

        var lockoutEnabledResult = await _userManager.SetLockoutEnabledAsync(user, true);
        EnsureSucceeded(lockoutEnabledResult, $"Failed to enable lockout for user '{userId}' before soft delete");

        var lockoutResult = await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow.AddYears(100));
        EnsureSucceeded(lockoutResult, $"Failed to lock user '{userId}' before soft delete");

        var now = DateTime.UtcNow;
        user.DeletedAt = now;
        user.UpdatedAt = now;

        var updateResult = await _userManager.UpdateAsync(user);
        EnsureSucceeded(updateResult, $"Failed to soft delete user '{userId}'");

        await _authenticationService.RevokeAllUserTokensAsync(userId);
    }

    public async Task RestoreUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException($"User with id '{userId}' was not found.");
        }

        if (user.DeletedAt == null)
        {
            return;
        }

        user.DeletedAt = null;

        var unlockResult = await _userManager.SetLockoutEndDateAsync(user, null);
        EnsureSucceeded(unlockResult, $"Failed to unlock user '{userId}' during restore");

        var resetFailsResult = await _userManager.ResetAccessFailedCountAsync(user);
        EnsureSucceeded(resetFailsResult, $"Failed to reset access failed count for user '{userId}' during restore");

        user.UpdatedAt = DateTime.UtcNow;
        var updateResult = await _userManager.UpdateAsync(user);
        EnsureSucceeded(updateResult, $"Failed to restore user '{userId}'");
    }

    private static AdminUserDto MapToAdminUserDto(
        ApplicationUser user,
        IEnumerable<string> roles)
    {
        return new AdminUserDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            UserName = user.UserName ?? string.Empty,
            EmailConfirmed = user.EmailConfirmed,
            LockoutEnabled = user.LockoutEnabled,
            LockoutEnd = user.LockoutEnd,
            AccessFailedCount = user.AccessFailedCount,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            DeletedAt = user.DeletedAt,
            Roles = roles.ToArray()
        };
    }

    public async Task<IdentityStatsDto> GetIdentityStatsAsync(
        CancellationToken cancellationToken = default)
    {
        var totalUsers = await _dbContext.Users.CountAsync(cancellationToken);
        var deletedUsers = await _dbContext.Users.CountAsync(
            u => u.DeletedAt != null,
            cancellationToken);

        return new IdentityStatsDto
        {
            TotalUsers = totalUsers,
            DeletedUsers = deletedUsers,
            ActiveUsers = totalUsers - deletedUsers
        };
    }

    private static void EnsureSucceeded(IdentityResult result, string message)
    {
        if (result.Succeeded)
        {
            return;
        }

        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
        throw new InvalidOperationException($"{message}: {errors}");
    }
}
