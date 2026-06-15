using Events.DataAccess;
using Events.DataAccess.Entities;
using Identity.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Facade.API.Seeding;

public sealed class DemoEventsSeeder
{
    private const string AdminEmail = "admin@local.dev";
    private const string AttendeeEmail = "test2@example.com";
    private const string EventTitleSuffix = "LinkUp Dev Meetup";

    private readonly EventsDbContext _eventsDb;
    private readonly DemoSeedUserLookup _userLookup;
    private readonly DemoSeedOptions _options;
    private readonly ILogger<DemoEventsSeeder> _logger;

    public DemoEventsSeeder(
        EventsDbContext eventsDb,
        DemoSeedUserLookup userLookup,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoEventsSeeder> logger)
    {
        _eventsDb = eventsDb;
        _userLookup = userLookup;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var users = await _userLookup.ResolveConfiguredUsersAsync(cancellationToken);
        var admin = _userLookup.TryGet(users, AdminEmail);
        if (admin is null)
        {
            _logger.LogWarning("Demo events seed skipped: admin user {Email} was not found.", AdminEmail);
            return;
        }

        var marker = NormalizeMarker(_options.MarkerPrefix);
        var eventTitle = $"{marker}{EventTitleSuffix}";

        var demoEvent = await _eventsDb.Events
            .FirstOrDefaultAsync(e => e.DeletedAt == null && e.Title == eventTitle, cancellationToken);

        if (demoEvent is null)
        {
            var startAt = DateTime.UtcNow.Date.AddDays(7).AddHours(18);
            demoEvent = new Event
            {
                Id = Guid.NewGuid(),
                OrganizerType = "user",
                OrganizerId = admin.Id,
                Title = eventTitle,
                Description = $"{marker} Monthly meetup for LinkUp diploma demo data.",
                Location = "Online",
                IsOnline = true,
                ExternalLink = "https://meet.example.com/linkup-dev",
                Timezone = "UTC",
                Visibility = "public",
                AllowComments = true,
                StartAt = startAt,
                EndAt = startAt.AddHours(2),
                CreatedAt = DateTime.UtcNow,
            };

            _eventsDb.Events.Add(demoEvent);
            await _eventsDb.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Demo events seed: created event {Title}.", eventTitle);
        }
        else
        {
            _logger.LogInformation("Demo events seed: event {Title} already exists; skipped create.", eventTitle);
        }

        var attendeeUser = _userLookup.TryGet(users, AttendeeEmail);
        if (attendeeUser is null)
        {
            _logger.LogWarning(
                "Demo events seed: attendee user {Email} was not found; event created without attendee.",
                AttendeeEmail);
            return;
        }

        var existingAttendee = await _eventsDb.EventAttendees
            .FirstOrDefaultAsync(
                a => a.EventId == demoEvent.Id && a.UserId == attendeeUser.Id,
                cancellationToken);

        if (existingAttendee is not null && existingAttendee.DeletedAt is null)
        {
            _logger.LogInformation(
                "Demo events seed: attendee {Email} already joined event {Title}.",
                AttendeeEmail,
                eventTitle);
            return;
        }

        if (existingAttendee is not null)
        {
            existingAttendee.DeletedAt = null;
            existingAttendee.Status = "joined";
            existingAttendee.JoinedAt = DateTime.UtcNow;
            existingAttendee.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            _eventsDb.EventAttendees.Add(new EventAttendee
            {
                Id = Guid.NewGuid(),
                EventId = demoEvent.Id,
                UserId = attendeeUser.Id,
                Status = "joined",
                JoinedAt = DateTime.UtcNow,
            });
        }

        await _eventsDb.SaveChangesAsync(cancellationToken);
        _logger.LogInformation(
            "Demo events seed: attendee {Email} joined event {Title}.",
            AttendeeEmail,
            eventTitle);
    }

    private static string NormalizeMarker(string? markerPrefix)
    {
        var marker = string.IsNullOrWhiteSpace(markerPrefix) ? "demo-seed:" : markerPrefix.Trim();
        return marker.EndsWith(' ') ? marker : marker;
    }
}
