using Identity.Contracts.DTOs;
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

    public async Task<IReadOnlyCollection<AdminUserDto>> GetUsersAsync(
        CancellationToken cancellationToken = default)
    {
        // TODO: add pagination for large user tables.
        var users = await _dbContext.Users
            .AsNoTracking()
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync(cancellationToken);

        var result = new List<AdminUserDto>(users.Count);
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            result.Add(MapToAdminUserDto(user, roles));
        }

        return result;
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
