using Identity.Contracts.Constants;
using Identity.DataAccess.Entities;
using Identity.Events.Contracts.Abstractions;
using Identity.Events.Contracts.Events;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Facade.API.Seeding;

/// <summary>
/// Creates baseline demo users (test1/test2). Admin is created separately by Identity <c>AdminSeed</c>.
/// </summary>
public sealed class DemoUsersSeeder : IDemoSeeder
{
    public int Order => 1;

    public string Name => nameof(DemoUsersSeeder);

    private const string AdminEmail = DemoSeedConstants.AdminEmail;

    private static readonly string[] DemoUserEmails =
    [
        DemoSeedConstants.TestUserOneEmail,
        DemoSeedConstants.TestUserTwoEmail,
    ];

    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IDomainEventPublisher _eventPublisher;
    private readonly DemoSeedOptions _options;
    private readonly ILogger<DemoUsersSeeder> _logger;

    public DemoUsersSeeder(
        UserManager<ApplicationUser> userManager,
        IDomainEventPublisher eventPublisher,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoUsersSeeder> logger)
    {
        _userManager = userManager;
        _eventPublisher = eventPublisher;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.DefaultUserPassword))
        {
            _logger.LogWarning("Demo users seed skipped: DemoSeed:DefaultUserPassword is not configured.");
            return;
        }

        var created = 0;

        foreach (var email in DemoUserEmails)
        {
            if (string.Equals(email, AdminEmail, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogDebug("Demo users seed: skipping admin user {Email}.", email);
                continue;
            }

            if (await EnsureDemoUserExistsAsync(email.Trim(), cancellationToken))
            {
                created++;
            }
        }

        _logger.LogInformation("Demo users seed finished: {Created} demo user(s) created.", created);
    }

    private async Task<bool> EnsureDemoUserExistsAsync(string email, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(email);

        if (user is not null && user.DeletedAt is not null)
        {
            _logger.LogWarning("Demo users seed: user {Email} is soft-deleted; skipped.", email);
            return false;
        }

        if (user is null)
        {
            user = new ApplicationUser
            {
                Email = email,
                UserName = email,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow,
            };

            var createResult = await _userManager.CreateAsync(user, _options.DefaultUserPassword);
            if (!createResult.Succeeded)
            {
                var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                _logger.LogError("Demo users seed: failed to create user {Email}: {Errors}", email, errors);
                return false;
            }

            _logger.LogInformation("Demo users seed: created user {Email}.", email);

            if (!await EnsureUserRoleAsync(user, email))
            {
                return true;
            }

            await _eventPublisher.PublishAsync(
                new UserRegisteredEvent
                {
                    UserId = user.Id,
                    UserName = user.UserName!,
                    Email = user.Email!,
                    RegisteredAt = user.CreatedAt,
                },
                cancellationToken);

            return true;
        }

        _logger.LogInformation("Demo users seed: user {Email} already exists; password unchanged.", email);
        await EnsureUserRoleAsync(user, email);
        return false;
    }

    private async Task<bool> EnsureUserRoleAsync(ApplicationUser user, string email)
    {
        if (await _userManager.IsInRoleAsync(user, IdentityRoleNames.User))
        {
            return true;
        }

        var roleResult = await _userManager.AddToRoleAsync(user, IdentityRoleNames.User);
        if (!roleResult.Succeeded)
        {
            var errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
            _logger.LogError(
                "Demo users seed: failed to assign User role to {Email}: {Errors}",
                email,
                errors);
            return false;
        }

        _logger.LogInformation("Demo users seed: assigned User role to {Email}.", email);
        return true;
    }
}
