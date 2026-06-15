using Identity.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Profile.Contracts.Services;
using Profile.DataAccess;
using Profile.DataAccess.Entities;

namespace Facade.API.Seeding;

public sealed class DemoShowcaseProfileSeeder
{
    private readonly ProfileDbContext _profileDb;
    private readonly IProfileService _profileService;
    private readonly Identity.DataAccess.IdentityDbContext _identityDb;
    private readonly ILogger<DemoShowcaseProfileSeeder> _logger;

    public DemoShowcaseProfileSeeder(
        ProfileDbContext profileDb,
        IProfileService profileService,
        Identity.DataAccess.IdentityDbContext identityDb,
        ILogger<DemoShowcaseProfileSeeder> logger)
    {
        _profileDb = profileDb;
        _profileService = profileService;
        _identityDb = identityDb;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo showcase profile seed started.");

        var users = await DemoSeederSupport.ResolveUsersByEmailsAsync(
            _identityDb,
            DemoShowcaseSeedData.ProfileTemplates.Select(t => t.Email)
                .Append(DemoShowcaseSeedData.AdminEmail),
            cancellationToken);

        var updated = 0;
        foreach (var template in DemoShowcaseSeedData.ProfileTemplates)
        {
            if (!users.TryGetValue(template.Email, out var user))
            {
                continue;
            }

            if (await ApplyTemplateAsync(user, template, cancellationToken))
            {
                updated++;
            }
        }

        await EnrichMaryaProfileAsync(users, cancellationToken);
        await NormalizeAdminProfileAsync(users, cancellationToken);

        _logger.LogInformation("Demo showcase profile seed finished: {Updated} profile(s) updated.", updated);
    }

    private async Task EnrichMaryaProfileAsync(
        IReadOnlyDictionary<string, ApplicationUser> users,
        CancellationToken cancellationToken)
    {
        if (!users.TryGetValue(DemoShowcaseSeedData.PrimaryDemoUserEmail, out var marya))
        {
            return;
        }

        var profile = await GetOrCreateProfileAsync(marya.Id, cancellationToken);
        if (profile is null)
        {
            return;
        }

        var changed = false;
        changed |= SetIfDifferent(profile, nameof(profile.FirstName), "Marya");
        changed |= SetIfDifferent(profile, nameof(profile.LastName), "Demo");
        changed |= SetIfDifferent(profile, nameof(profile.ProfileTitle), "Lead UI/UX Designer");
        changed |= SetIfDifferent(profile, nameof(profile.Headline), "Lead UI/UX Designer · CD Project Red");
        changed |= SetIfDifferent(
            profile,
            nameof(profile.GenInfo),
            "Experienced UI/UX designer with focus on product design.");
        changed |= SetIfDifferent(profile, nameof(profile.University), "Warsaw University");
        changed |= SetIfDifferent(profile, nameof(profile.Location), "Warsaw, Poland");
        changed |= SetIfDifferent(profile, nameof(profile.PortfolioUrl), "https://portfolio.example.com");
        changed |= SetIfDifferent(profile, nameof(profile.AvatarUrl), "marya.jpg");
        changed |= SetIfDifferent(profile, nameof(profile.HeaderUrl), "david.jpg");

        if (changed)
        {
            profile.UpdatedAt = DateTime.UtcNow;
            await _profileDb.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Demo showcase profile seed: enriched Marya demo profile.");
        }
    }

    private async Task NormalizeAdminProfileAsync(
        IReadOnlyDictionary<string, ApplicationUser> users,
        CancellationToken cancellationToken)
    {
        if (!users.TryGetValue(DemoShowcaseSeedData.AdminEmail, out var admin))
        {
            return;
        }

        var profile = await GetOrCreateProfileAsync(admin.Id, cancellationToken);
        if (profile is null)
        {
            return;
        }

        var changed = false;
        changed |= SetIfDifferent(profile, nameof(profile.FirstName), "Admin");
        changed |= SetIfDifferent(profile, nameof(profile.LastName), "User");
        changed |= SetIfDifferent(profile, nameof(profile.ProfileTitle), "System Administrator");
        changed |= SetIfDifferent(profile, nameof(profile.Headline), "System Administrator");
        changed |= SetIfDifferent(
            profile,
            nameof(profile.GenInfo),
            "Technical account for admin panel access.");

        if (changed)
        {
            profile.UpdatedAt = DateTime.UtcNow;
            await _profileDb.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Demo showcase profile seed: normalized admin profile.");
        }
    }

    private async Task<bool> ApplyTemplateAsync(
        ApplicationUser user,
        (string Email, string First, string Last, string Title, string Location, string? Avatar) template,
        CancellationToken cancellationToken)
    {
        if (string.Equals(template.Email, DemoShowcaseSeedData.PrimaryDemoUserEmail, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var profile = await GetOrCreateProfileAsync(user.Id, cancellationToken);
        if (profile is null)
        {
            return false;
        }

        var changed = false;
        changed |= SetIfDifferent(profile, nameof(profile.FirstName), template.First);
        changed |= SetIfDifferent(profile, nameof(profile.LastName), template.Last);
        changed |= SetIfDifferent(profile, nameof(profile.ProfileTitle), template.Title);
        changed |= SetIfDifferent(profile, nameof(profile.Headline), template.Title);
        changed |= SetIfDifferent(profile, nameof(profile.Location), template.Location);

        if (!string.IsNullOrWhiteSpace(template.Avatar))
        {
            changed |= SetIfDifferent(profile, nameof(profile.AvatarUrl), template.Avatar);
        }

        if (string.Equals(template.Email, DemoShowcaseSeedData.DavidJonsonEmail, StringComparison.OrdinalIgnoreCase))
        {
            changed |= SetIfDifferent(profile, nameof(profile.HeaderUrl), "david.jpg");
            changed |= SetIfDifferent(profile, nameof(profile.PortfolioUrl), "https://davidjonson.design");
            changed |= SetIfDifferent(
                profile,
                nameof(profile.GenInfo),
                "Product designer focused on mobile experiences and design systems.");
        }

        if (!changed)
        {
            return false;
        }

        profile.UpdatedAt = DateTime.UtcNow;
        await _profileDb.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Demo showcase profile seed: updated profile for {Email}.", user.Email);
        return true;
    }

    private async Task<UserProfile?> GetOrCreateProfileAsync(string userId, CancellationToken cancellationToken)
    {
        var profile = await _profileDb.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId && p.DeletedAt == null, cancellationToken);

        if (profile is not null)
        {
            return profile;
        }

        await _profileService.CreateEmptyAsync(userId);
        return await _profileDb.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId && p.DeletedAt == null, cancellationToken);
    }

    private static bool SetIfDifferent(UserProfile profile, string propertyName, string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var property = typeof(UserProfile).GetProperty(propertyName);
        if (property is null)
        {
            return false;
        }

        var current = property.GetValue(profile) as string;
        if (string.Equals(current, value, StringComparison.Ordinal))
        {
            return false;
        }

        property.SetValue(profile, value);
        return true;
    }
}
