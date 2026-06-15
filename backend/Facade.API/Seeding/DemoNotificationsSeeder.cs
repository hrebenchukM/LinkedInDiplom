using Content.DataAccess;
using Identity.DataAccess.Entities;
using Jobs.DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Notifications.Contracts.Parameters.Notification;
using Notifications.Contracts.Services;
using Notifications.DataAccess;

namespace Facade.API.Seeding;

public sealed class DemoNotificationsSeeder
{
    private readonly NotificationsDbContext _notificationsDb;
    private readonly ContentDbContext _contentDb;
    private readonly JobsDbContext _jobsDb;
    private readonly Events.DataAccess.EventsDbContext _eventsDb;
    private readonly Identity.DataAccess.IdentityDbContext _identityDb;
    private readonly INotificationService _notificationService;
    private readonly DemoSeedOptions _options;
    private readonly ILogger<DemoNotificationsSeeder> _logger;

    public DemoNotificationsSeeder(
        NotificationsDbContext notificationsDb,
        ContentDbContext contentDb,
        JobsDbContext jobsDb,
        Events.DataAccess.EventsDbContext eventsDb,
        Identity.DataAccess.IdentityDbContext identityDb,
        INotificationService notificationService,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoNotificationsSeeder> logger)
    {
        _notificationsDb = notificationsDb;
        _contentDb = contentDb;
        _jobsDb = jobsDb;
        _eventsDb = eventsDb;
        _identityDb = identityDb;
        _notificationService = notificationService;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo notifications seed started.");

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
            _logger.LogWarning("Demo notifications seed skipped: primary demo user not found.");
            return;
        }

        users.TryGetValue(DemoShowcaseSeedData.EmmaEmail, out var emma);
        users.TryGetValue(DemoShowcaseSeedData.LucasEmail, out var lucas);

        var marker = DemoSeederSupport.NormalizeMarker(_options.MarkerPrefix);
        var maryaPost = await _contentDb.Posts
            .AsNoTracking()
            .Where(p => p.DeletedAt == null && p.UserId == marya.Id && p.Content.StartsWith(marker))
            .OrderBy(p => p.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        var vacancy = await _jobsDb.Vacancies
            .AsNoTracking()
            .Where(v => v.DeletedAt == null)
            .OrderByDescending(v => v.PostedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (emma is not null && maryaPost is not null)
        {
            await EnsureNotificationAsync(
                marya.Id,
                emma.Id,
                "post_like",
                "New like on your post",
                "Emma Stone liked your post",
                "post",
                maryaPost.Id,
                isRead: false,
                cancellationToken);
        }

        if (lucas is not null && maryaPost is not null)
        {
            await EnsureNotificationAsync(
                marya.Id,
                lucas.Id,
                "post_comment",
                "New comment on your post",
                "Lucas Brown commented on your post",
                "post",
                maryaPost.Id,
                isRead: false,
                cancellationToken);
        }

        if (emma is not null)
        {
            await EnsureNotificationAsync(
                marya.Id,
                emma.Id,
                "contact_request_accepted",
                "Connection request accepted",
                "Emma Stone accepted your connection request",
                "user",
                null,
                isRead: true,
                cancellationToken);
        }

        if (vacancy is not null)
        {
            await EnsureNotificationAsync(
                marya.Id,
                null,
                "vacancy_recommendation",
                "New job recommendation",
                "Google posted a new job: Senior UI/UX Designer",
                "vacancy",
                vacancy.Id,
                isRead: false,
                cancellationToken);
        }

        var eventTitle = $"{marker}Design Systems Conference 2026";
        var demoEvent = await _eventsDb.Events
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.DeletedAt == null && e.Title == eventTitle, cancellationToken);

        if (demoEvent is not null)
        {
            await EnsureNotificationAsync(
                marya.Id,
                null,
                "event_reminder",
                "Upcoming event",
                "Design Systems Conference 2026 starts soon",
                "event",
                demoEvent.Id,
                isRead: false,
                cancellationToken);
        }

        _logger.LogInformation("Demo notifications seed finished.");
    }

    private async Task EnsureNotificationAsync(
        string userId,
        string? actorUserId,
        string type,
        string title,
        string body,
        string entityType,
        Guid? entityId,
        bool isRead,
        CancellationToken cancellationToken)
    {
        var exists = await _notificationsDb.Notifications.AnyAsync(
            n =>
                n.DeletedAt == null &&
                n.UserId == userId &&
                n.Type == type &&
                n.Title == title,
            cancellationToken);

        if (exists)
        {
            return;
        }

        var result = await _notificationService.CreateAsync(new CreateNotificationParameters
        {
            UserId = userId,
            ActorUserId = actorUserId,
            Type = type,
            Title = title,
            Body = body,
            EntityType = entityType,
            EntityId = entityId,
        });

        if (!result.Succeeded || result.Notification is null)
        {
            _logger.LogWarning(
                "Demo notifications seed: failed to create notification {Title}: {Errors}",
                title,
                string.Join(", ", result.Errors));
            return;
        }

        if (isRead)
        {
            var notification = await _notificationsDb.Notifications
                .FirstOrDefaultAsync(n => n.Id == result.Notification.Id, cancellationToken);

            if (notification is not null)
            {
                notification.IsRead = true;
                notification.UpdatedAt = DateTime.UtcNow;
                await _notificationsDb.SaveChangesAsync(cancellationToken);
            }
        }
    }
}
