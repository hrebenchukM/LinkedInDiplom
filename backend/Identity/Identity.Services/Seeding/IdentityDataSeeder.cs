using Identity.Contracts.Constants;
using Identity.Contracts.Options;
using Identity.Contracts.Services;
using Identity.DataAccess.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Identity.Services.Seeding;

public class IdentityDataSeeder : IIdentityDataSeeder
{
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AdminSeedOptions _adminSeedOptions;
    private readonly ILogger<IdentityDataSeeder> _logger;

    public IdentityDataSeeder(
        RoleManager<IdentityRole> roleManager,
        UserManager<ApplicationUser> userManager,
        IOptions<AdminSeedOptions> adminSeedOptions,
        ILogger<IdentityDataSeeder> logger)
    {
        _roleManager = roleManager;
        _userManager = userManager;
        _adminSeedOptions = adminSeedOptions.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await EnsureRoleExistsAsync(IdentityRoleNames.Admin, cancellationToken);
        await EnsureRoleExistsAsync(IdentityRoleNames.User, cancellationToken);
        await EnsureAdminUserExistsAsync(cancellationToken);
    }

    private async Task EnsureRoleExistsAsync(string roleName, CancellationToken cancellationToken)
    {
        if (await _roleManager.RoleExistsAsync(roleName))
        {
            _logger.LogDebug("Role {RoleName} already exists.", roleName);
            return;
        }

        var result = await _roleManager.CreateAsync(new IdentityRole(roleName));

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to create role '{roleName}': {errors}");
        }

        _logger.LogInformation("Created role {RoleName}.", roleName);
    }

    private async Task EnsureAdminUserExistsAsync(CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_adminSeedOptions.Email) ||
            string.IsNullOrWhiteSpace(_adminSeedOptions.Password))
        {
            _logger.LogWarning(
                "Admin seed skipped: Email or Password is not configured in AdminSeed settings.");
            return;
        }

        var email = _adminSeedOptions.Email.Trim();
        var userName = string.IsNullOrWhiteSpace(_adminSeedOptions.UserName)
            ? email
            : _adminSeedOptions.UserName.Trim();

        var adminUser = await _userManager.FindByEmailAsync(email);

        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                Email = email,
                UserName = userName,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(adminUser, _adminSeedOptions.Password);

            if (!createResult.Succeeded)
            {
                var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to create admin user '{email}': {errors}");
            }

            _logger.LogInformation("Created admin user {Email}.", email);
        }
        else
        {
            _logger.LogInformation("Admin user {Email} already exists.", email);
        }

        if (await _userManager.IsInRoleAsync(adminUser, IdentityRoleNames.Admin))
        {
            _logger.LogInformation(
                "Admin user {Email} already has role {RoleName}.",
                email,
                IdentityRoleNames.Admin);
            return;
        }

        var roleResult = await _userManager.AddToRoleAsync(adminUser, IdentityRoleNames.Admin);

        if (!roleResult.Succeeded)
        {
            var errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to assign Admin role to '{email}': {errors}");
        }

        _logger.LogInformation(
            "Assigned role {RoleName} to admin user {Email}.",
            IdentityRoleNames.Admin,
            email);
    }
}
