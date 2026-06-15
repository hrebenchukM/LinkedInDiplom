using Identity.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Profile.Contracts.Services;
using Profile.DataAccess;
using Profile.DataAccess.Entities;

namespace Facade.API.Seeding;

public sealed class DemoProfileSeeder
{
    private static readonly IReadOnlyDictionary<string, (string FirstName, string LastName, string Headline)> ProfileSeeds =
        new Dictionary<string, (string, string, string)>(StringComparer.OrdinalIgnoreCase)
        {
            ["admin@local.dev"] = ("Admin", "User", "Platform Administrator"),
            ["test@example.com"] = ("Test", "User One", "Frontend Developer"),
            ["test2@example.com"] = ("Test", "User Two", "Backend Developer"),
        };

    private readonly ProfileDbContext _profileDb;
    private readonly IProfileService _profileService;
    private readonly DemoSeedUserLookup _userLookup;
    private readonly ILogger<DemoProfileSeeder> _logger;

    public DemoProfileSeeder(
        ProfileDbContext profileDb,
        IProfileService profileService,
        DemoSeedUserLookup userLookup,
        ILogger<DemoProfileSeeder> logger)
    {
        _profileDb = profileDb;
        _profileService = profileService;
        _userLookup = userLookup;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var users = await _userLookup.ResolveConfiguredUsersAsync(cancellationToken);
        var updated = 0;

        foreach (var (email, seed) in ProfileSeeds)
        {
            var user = _userLookup.TryGet(users, email);
            if (user is null)
            {
                continue;
            }

            if (await ApplyProfileSeedAsync(user, seed, cancellationToken))
            {
                updated++;
            }
        }

        _logger.LogInformation("Demo profile seed finished: {Updated} profile(s) updated.", updated);
    }

    private async Task<bool> ApplyProfileSeedAsync(
        ApplicationUser user,
        (string FirstName, string LastName, string Headline) seed,
        CancellationToken cancellationToken)
    {
        var profile = await _profileDb.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == user.Id && p.DeletedAt == null, cancellationToken);

        if (profile is null)
        {
            await _profileService.CreateEmptyAsync(user.Id);
            profile = await _profileDb.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == user.Id && p.DeletedAt == null, cancellationToken);

            if (profile is null)
            {
                _logger.LogWarning(
                    "Demo profile seed: profile for {Email} was not created automatically; skipped.",
                    user.Email);
                return false;
            }

            profile.FirstName = seed.FirstName;
            profile.LastName = seed.LastName;
            profile.Headline = seed.Headline;
            profile.UpdatedAt = DateTime.UtcNow;
            await _profileDb.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Demo profile seed: created profile for {Email}.", user.Email);
            return true;
        }

        var changed = false;

        if (string.IsNullOrWhiteSpace(profile.FirstName))
        {
            profile.FirstName = seed.FirstName;
            changed = true;
        }

        if (string.IsNullOrWhiteSpace(profile.LastName))
        {
            profile.LastName = seed.LastName;
            changed = true;
        }

        if (string.IsNullOrWhiteSpace(profile.Headline))
        {
            profile.Headline = seed.Headline;
            changed = true;
        }

        if (!changed)
        {
            _logger.LogDebug("Demo profile seed: profile for {Email} already has name/headline; skipped.", user.Email);
            return false;
        }

        profile.UpdatedAt = DateTime.UtcNow;
        await _profileDb.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Demo profile seed: updated empty fields for {Email}.", user.Email);
        return true;
    }
}
