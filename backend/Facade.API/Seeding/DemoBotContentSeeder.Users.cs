using Identity.Contracts.Constants;
using Identity.DataAccess.Entities;
using Identity.Events.Contracts.Events;
using Microsoft.AspNetCore.Identity;

namespace Facade.API.Seeding;

public sealed partial class DemoBotContentSeeder
{
    private async Task<(Dictionary<string, string> BotUsers, int Added, int Skipped)> EnsureBotUsersAsync(
        CancellationToken cancellationToken)
    {
        var botUsers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var added = 0;
        var skipped = 0;
        var processedEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var persona in DemoBotCatalog.Bots)
        {
            if (!processedEmails.Add(persona.Email))
            {
                continue;
            }

            var existing = await _userManager.FindByEmailAsync(persona.Email);
            if (existing?.Id != null && existing.DeletedAt == null)
            {
                botUsers[persona.Email] = existing.Id;
                skipped++;
                continue;
            }

            var user = new ApplicationUser
            {
                UserName = persona.UserName,
                Email = persona.Email,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow,
            };

            var createResult = await _userManager.CreateAsync(user, _options.DefaultUserPassword);
            if (!createResult.Succeeded)
            {
                var errors = string.Join(", ", createResult.Errors.Select(error => error.Description));
                _logger.LogWarning(
                    "Demo bot content seed: failed to create user {Email}: {Errors}",
                    persona.Email,
                    errors);
                continue;
            }

            var roleResult = await _userManager.AddToRoleAsync(user, IdentityRoleNames.User);
            if (!roleResult.Succeeded)
            {
                var errors = string.Join(", ", roleResult.Errors.Select(error => error.Description));
                _logger.LogWarning(
                    "Demo bot content seed: failed to assign User role to {Email}: {Errors}",
                    persona.Email,
                    errors);
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

            botUsers[persona.Email] = user.Id;
            added++;
            _logger.LogInformation("Demo bot content seed: registered bot {Email}.", persona.Email);
        }

        return (botUsers, added, skipped);
    }
}
