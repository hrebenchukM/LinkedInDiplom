using Content.Contracts.Parameters.PostView;
using Content.Contracts.Services;
using Content.DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Notifications.Contracts.Parameters.UserActivity;
using Notifications.Contracts.Services;
using Notifications.DataAccess;
using Profile.Contracts.Parameters.ProfileView;
using Profile.Contracts.Services;

namespace Facade.API.Seeding;

public sealed class DemoShowcaseViewsSeeder : IDemoSeeder
{
    public int Order => 24;

    public string Name => nameof(DemoShowcaseViewsSeeder);

    private readonly ContentDbContext _contentDb;
    private readonly NotificationsDbContext _notificationsDb;
    private readonly Identity.DataAccess.IdentityDbContext _identityDb;
    private readonly IProfileViewService _profileViewService;
    private readonly IPostViewService _postViewService;
    private readonly IUserActivityService _userActivityService;
    private readonly DemoSeedOptions _options;
    private readonly ILogger<DemoShowcaseViewsSeeder> _logger;

    public DemoShowcaseViewsSeeder(
        ContentDbContext contentDb,
        NotificationsDbContext notificationsDb,
        Identity.DataAccess.IdentityDbContext identityDb,
        IProfileViewService profileViewService,
        IPostViewService postViewService,
        IUserActivityService userActivityService,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoShowcaseViewsSeeder> logger)
    {
        _contentDb = contentDb;
        _notificationsDb = notificationsDb;
        _identityDb = identityDb;
        _profileViewService = profileViewService;
        _postViewService = postViewService;
        _userActivityService = userActivityService;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo showcase views/activity seed started.");

        var users = await DemoSeederSupport.ResolveUsersByEmailsAsync(
            _identityDb,
            new[]
            {
                DemoShowcaseSeedData.PrimaryDemoUserEmail,
                DemoShowcaseSeedData.EmmaEmail,
                DemoShowcaseSeedData.LucasEmail,
            },
            cancellationToken);

        if (!users.TryGetValue(DemoShowcaseSeedData.PrimaryDemoUserEmail, out var marya))
        {
            return;
        }

        users.TryGetValue(DemoShowcaseSeedData.EmmaEmail, out var emma);
        users.TryGetValue(DemoShowcaseSeedData.LucasEmail, out var lucas);

        if (emma is not null)
        {
            await _profileViewService.RecordProfileViewAsync(new RecordProfileViewParameters
            {
                ProfileOwnerId = marya.Id,
                ViewerUserId = emma.Id,
                ViewerIp = "127.0.0.1",
                Source = "demo-seed",
            });
        }

        var marker = DemoSeederSupport.NormalizeMarker(_options.MarkerPrefix);
        var maryaPosts = await _contentDb.Posts
            .AsNoTracking()
            .Where(p => p.DeletedAt == null && p.UserId == marya.Id && p.Content.StartsWith(marker))
            .Take(3)
            .ToListAsync(cancellationToken);

        foreach (var post in maryaPosts)
        {
            await _postViewService.RecordAsync(new RecordPostViewParameters
            {
                ViewerUserId = emma?.Id ?? marya.Id,
                PostId = post.Id,
                ViewerIp = "127.0.0.1",
                Source = "demo-seed",
            });
        }

        if (emma is not null)
        {
            await EnsureActivityAsync(
                emma.Id,
                "career_update",
                "user",
                null,
                "Started new position as Junior UI/UX Designer",
                cancellationToken);
        }

        if (lucas is not null)
        {
            await EnsureActivityAsync(
                lucas.Id,
                "birthday",
                "user",
                null,
                "Lucas Brown is celebrating birthday today",
                cancellationToken);

            await EnsureActivityAsync(
                lucas.Id,
                "career_update",
                "user",
                null,
                "Promoted to Team Lead at Innovation Labs",
                cancellationToken);
        }

        await EnsureActivityAsync(
            marya.Id,
            "education",
            "user",
            null,
            "Graduated from University, UCLA, Computer Science",
            cancellationToken);

        if (emma is not null && maryaPosts.Count > 0)
        {
            await EnsureActivityAsync(
                emma.Id,
                "post_like",
                "post",
                maryaPosts[0].Id,
                "Liked Marya showcase post",
                cancellationToken);
        }

        _logger.LogInformation("Demo showcase views/activity seed finished.");
    }

    private async Task EnsureActivityAsync(
        string userId,
        string action,
        string entityType,
        Guid? entityId,
        string meta,
        CancellationToken cancellationToken)
    {
        var exists = await _notificationsDb.UserActivities.AnyAsync(
            a => a.UserId == userId && a.Action == action && a.Meta == meta,
            cancellationToken);

        if (exists)
        {
            return;
        }

        await _userActivityService.CreateAsync(new CreateUserActivityParameters
        {
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Meta = meta,
        });
    }
}
