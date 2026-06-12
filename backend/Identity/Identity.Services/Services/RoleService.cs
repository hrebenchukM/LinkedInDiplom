using Identity.Contracts.Constants;
using Identity.Contracts.DTOs;
using Identity.Contracts.Services;
using Identity.DataAccess.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Identity.Services.Services;

public class RoleService : IRoleService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public RoleService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<IReadOnlyCollection<RoleDto>> GetRolesAsync(CancellationToken cancellationToken = default)
    {
        var roles = await _roleManager.Roles
            .AsNoTracking()
            .OrderBy(r => r.Name)
            .ToListAsync(cancellationToken);

        return roles
            .Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name ?? string.Empty
            })
            .ToList();
    }

    public async Task<IReadOnlyCollection<string>> GetUserRolesAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException($"User with id '{userId}' was not found.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        return roles.ToList();
    }

    public async Task AddUserToRoleAsync(
        string userId,
        string roleName,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException($"User with id '{userId}' was not found.");
        }

        var exists = await _roleManager.RoleExistsAsync(roleName);
        if (!exists)
        {
            throw new InvalidOperationException($"Role '{roleName}' was not found.");
        }

        if (await _userManager.IsInRoleAsync(user, roleName))
        {
            return;
        }

        var result = await _userManager.AddToRoleAsync(user, roleName);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException(
                $"Failed to add user '{userId}' to role '{roleName}': {errors}");
        }
    }

    public async Task RemoveUserFromRoleAsync(
        string userId,
        string roleName,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException($"User with id '{userId}' was not found.");
        }

        var exists = await _roleManager.RoleExistsAsync(roleName);
        if (!exists)
        {
            throw new InvalidOperationException($"Role '{roleName}' was not found.");
        }

        if (!await _userManager.IsInRoleAsync(user, roleName))
        {
            return;
        }

        if (string.Equals(roleName, IdentityRoleNames.Admin, StringComparison.OrdinalIgnoreCase))
        {
            var admins = await _userManager.GetUsersInRoleAsync(IdentityRoleNames.Admin);
            if (admins.Count <= 1 && admins.Any(a => a.Id == userId))
            {
                throw new InvalidOperationException("Cannot remove Admin role from the last admin user.");
            }
        }

        var result = await _userManager.RemoveFromRoleAsync(user, roleName);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException(
                $"Failed to remove role '{roleName}' from user '{userId}': {errors}");
        }
    }
}
