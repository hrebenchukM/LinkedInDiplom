using Identity.Contracts.Constants;
using Identity.DataAccess;
using Identity.DataAccess.Entities;
using Identity.Events.Contracts.Abstractions;
using Identity.Events.Contracts.Events;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Facade.API.Seeding;

internal static class DemoSeederSupport
{
    public static string NormalizeMarker(string? markerPrefix)
    {
        var marker = string.IsNullOrWhiteSpace(markerPrefix)
            ? DemoSeedConstants.DefaultMarkerPrefix
            : markerPrefix.Trim();
        return marker.EndsWith(' ') ? marker : marker;
    }

    public static async Task<IReadOnlyDictionary<string, ApplicationUser>> ResolveUsersByEmailsAsync(
        IdentityDbContext identityDb,
        IEnumerable<string> emails,
        CancellationToken cancellationToken = default)
    {
        var result = new Dictionary<string, ApplicationUser>(StringComparer.OrdinalIgnoreCase);
        foreach (var email in emails.Where(e => !string.IsNullOrWhiteSpace(e)).Select(e => e.Trim()).Distinct(StringComparer.OrdinalIgnoreCase))
        {
            var user = await identityDb.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email && u.DeletedAt == null, cancellationToken);

            if (user is not null)
            {
                result[email] = user;
            }
        }

        return result;
    }

    public static async Task<ApplicationUser?> EnsureDemoUserAsync(
        UserManager<ApplicationUser> userManager,
        IDomainEventPublisher eventPublisher,
        DemoSeedOptions options,
        string email,
        ILogger logger,
        CancellationToken cancellationToken = default,
        string? passwordOverride = null)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return null;
        }

        var normalizedEmail = email.Trim();
        var user = await userManager.FindByEmailAsync(normalizedEmail);

        if (user is not null && user.DeletedAt is not null)
        {
            logger.LogWarning("Demo seed: user {Email} is soft-deleted; skipped.", normalizedEmail);
            return null;
        }

        if (user is not null)
        {
            await EnsureUserRoleAsync(userManager, user, normalizedEmail, logger);

            if (!string.IsNullOrWhiteSpace(passwordOverride))
            {
                await EnsurePasswordAsync(userManager, user, passwordOverride, logger);
            }

            return user;
        }

        var password = passwordOverride;
        if (string.IsNullOrWhiteSpace(password))
        {
            password = options.DefaultUserPassword;
        }

        if (string.IsNullOrWhiteSpace(password))
        {
            logger.LogWarning("Demo seed: cannot create {Email}; password is missing.", normalizedEmail);
            return null;
        }

        user = new ApplicationUser
        {
            Email = normalizedEmail,
            UserName = normalizedEmail,
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow,
        };

        var createResult = await userManager.CreateAsync(user, password);
        if (!createResult.Succeeded)
        {
            var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
            logger.LogError("Demo seed: failed to create user {Email}: {Errors}", normalizedEmail, errors);
            return null;
        }

        logger.LogInformation("Demo seed: created user {Email}.", normalizedEmail);
        await EnsureUserRoleAsync(userManager, user, normalizedEmail, logger);

        await eventPublisher.PublishAsync(
            new UserRegisteredEvent
            {
                UserId = user.Id,
                UserName = user.UserName!,
                Email = user.Email!,
                RegisteredAt = user.CreatedAt,
            },
            cancellationToken);

        return user;
    }

    private static async Task EnsureUserRoleAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationUser user,
        string email,
        ILogger logger)
    {
        if (await userManager.IsInRoleAsync(user, IdentityRoleNames.User))
        {
            return;
        }

        var roleResult = await userManager.AddToRoleAsync(user, IdentityRoleNames.User);
        if (!roleResult.Succeeded)
        {
            var errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
            logger.LogError("Demo seed: failed to assign User role to {Email}: {Errors}", email, errors);
        }
    }

    private static async Task EnsurePasswordAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationUser user,
        string password,
        ILogger logger)
    {
        if (await userManager.CheckPasswordAsync(user, password))
        {
            return;
        }

        var resetToken = await userManager.GeneratePasswordResetTokenAsync(user);
        var resetResult = await userManager.ResetPasswordAsync(user, resetToken, password);
        if (!resetResult.Succeeded)
        {
            var errors = string.Join(", ", resetResult.Errors.Select(e => e.Description));
            logger.LogWarning(
                "Demo seed: failed to reset password for {Email}: {Errors}",
                user.Email,
                errors);
        }
    }
}
