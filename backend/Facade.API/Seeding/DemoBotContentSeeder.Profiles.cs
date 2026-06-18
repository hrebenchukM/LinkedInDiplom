using Profile.Contracts.DTOs;
using Profile.Contracts.Parameters;

namespace Facade.API.Seeding;

public sealed partial class DemoBotContentSeeder
{
    private async Task<(int Added, int Updated, int Skipped)> EnsureBotProfilesAsync(
        IReadOnlyDictionary<string, string> botUsers,
        CancellationToken cancellationToken)
    {
        var added = 0;
        var updated = 0;
        var skipped = 0;
        var processedEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var persona in DemoBotCatalog.Bots)
        {
            if (!processedEmails.Add(persona.Email))
            {
                continue;
            }

            if (!botUsers.TryGetValue(persona.Email, out var userId))
            {
                continue;
            }

            var existing = await _profileService.GetAsync(new GetProfileByUserIdParameters
            {
                UserId = userId,
            });

            var needsUpdate = existing == null ||
                              string.IsNullOrWhiteSpace(existing.FirstName) ||
                              string.IsNullOrWhiteSpace(existing.Headline);

            if (!needsUpdate)
            {
                skipped++;
                continue;
            }

            var isNew = existing == null;
            var profile = existing ?? new UserProfileDto
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
            };

            await _profileService.UpdateAsync(profile with
            {
                FirstName = persona.FirstName,
                LastName = persona.LastName,
                FullName = $"{persona.FirstName} {persona.LastName}".Trim(),
                Headline = persona.Headline,
                ProfileTitle = persona.Headline,
                Location = persona.Location,
                AvatarUrl = DemoBotCatalog.AvatarUrlFor(persona.UserName),
                GenInfo = $"Demo profile for {persona.FirstName} {persona.LastName}.",
            });

            if (isNew)
            {
                added++;
            }
            else
            {
                updated++;
            }
        }

        return (added, updated, skipped);
    }
}
