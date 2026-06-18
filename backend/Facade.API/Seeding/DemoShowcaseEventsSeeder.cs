using Events.DataAccess;
using Events.DataAccess.Entities;
using Identity.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Facade.API.Seeding;

public sealed class DemoShowcaseEventsSeeder : IDemoSeeder
{
    public int Order => 14;

    public string Name => nameof(DemoShowcaseEventsSeeder);

    private const string EventTitle = "Design Systems Conference 2026";
    private const int ShowcaseEventLeadDays = 21;
    private static readonly TimeSpan DefaultEventDuration = TimeSpan.FromHours(8);

    private readonly EventsDbContext _eventsDb;
    private readonly Identity.DataAccess.IdentityDbContext _identityDb;
    private readonly DemoSeedOptions _options;
    private readonly ILogger<DemoShowcaseEventsSeeder> _logger;

    public DemoShowcaseEventsSeeder(
        EventsDbContext eventsDb,
        Identity.DataAccess.IdentityDbContext identityDb,
        IOptions<DemoSeedOptions> options,
        ILogger<DemoShowcaseEventsSeeder> logger)
    {
        _eventsDb = eventsDb;
        _identityDb = identityDb;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Demo showcase events seed started.");

        var users = await DemoSeederSupport.ResolveUsersByEmailsAsync(
            _identityDb,
            [DemoShowcaseSeedData.PrimaryDemoUserEmail],
            cancellationToken);

        if (!users.TryGetValue(DemoShowcaseSeedData.PrimaryDemoUserEmail, out var marya))
        {
            _logger.LogWarning("Demo showcase events seed skipped: primary demo user not found.");
            return;
        }

        var marker = DemoSeederSupport.NormalizeMarker(_options.MarkerPrefix);
        var eventTitle = $"{marker}{EventTitle}";

        var demoEvent = await _eventsDb.Events
            .FirstOrDefaultAsync(e => e.DeletedAt == null && e.Title == eventTitle, cancellationToken);

        if (demoEvent is null)
        {
            var startAt = ComputeShowcaseStartAt();
            demoEvent = new Event
            {
                Id = Guid.NewGuid(),
                OrganizerType = "user",
                OrganizerId = marya.Id,
                Title = eventTitle,
                Description =
                    $"{marker} Join us for a full day of inspiring talks, workshops, and networking opportunities with leading designers from around the world.",
                CoverImageUrl = "design-systems-2026.jpg",
                Location = "Moscone Center, San Francisco, CA",
                IsOnline = false,
                Visibility = "public",
                AllowComments = true,
                StartAt = startAt,
                EndAt = startAt.Add(DefaultEventDuration),
                Timezone = "America/Los_Angeles",
                CreatedAt = DateTime.UtcNow,
            };

            _eventsDb.Events.Add(demoEvent);
            await _eventsDb.SaveChangesAsync(cancellationToken);
            _logger.LogInformation(
                "Demo showcase events seed: created event {Title} with StartAt={StartAt}.",
                eventTitle,
                demoEvent.StartAt);
        }
        else
        {
            await EnsureUpcomingDatesAsync(demoEvent, cancellationToken);
        }

        await EnsureAttendeeAsync(demoEvent.Id, marya.Id, cancellationToken);
        await EnsureSpeakersAndScheduleAsync(demoEvent.Id, cancellationToken);

        _logger.LogInformation("Demo showcase events seed finished.");
    }

    private static DateTime ComputeShowcaseStartAt() =>
        DateTime.UtcNow.AddDays(ShowcaseEventLeadDays);

    private async Task EnsureUpcomingDatesAsync(Event demoEvent, CancellationToken cancellationToken)
    {
        if (demoEvent.StartAt >= DateTime.UtcNow)
        {
            return;
        }

        var duration = demoEvent.EndAt.HasValue && demoEvent.EndAt.Value > demoEvent.StartAt
            ? demoEvent.EndAt.Value - demoEvent.StartAt
            : DefaultEventDuration;

        var previousStartAt = demoEvent.StartAt;
        var newStartAt = ComputeShowcaseStartAt();
        demoEvent.StartAt = newStartAt;
        demoEvent.EndAt = newStartAt.Add(duration);
        demoEvent.UpdatedAt = DateTime.UtcNow;

        await _eventsDb.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Demo showcase events seed: rolled event {Title} from StartAt={PreviousStartAt} to StartAt={StartAt}, EndAt={EndAt}.",
            demoEvent.Title,
            previousStartAt,
            demoEvent.StartAt,
            demoEvent.EndAt);
    }

    private async Task EnsureAttendeeAsync(Guid eventId, string userId, CancellationToken cancellationToken)
    {
        var existingAttendee = await _eventsDb.EventAttendees
            .FirstOrDefaultAsync(a => a.EventId == eventId && a.UserId == userId, cancellationToken);

        if (existingAttendee is not null && existingAttendee.DeletedAt is null)
        {
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
                EventId = eventId,
                UserId = userId,
                Status = "joined",
                JoinedAt = DateTime.UtcNow,
            });
        }

        await _eventsDb.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureSpeakersAndScheduleAsync(Guid eventId, CancellationToken cancellationToken)
    {
        var speakerTemplates = new (string Name, string Title, string Avatar)[]
        {
            ("Sarah Mitchell", "Design Director at Google", "sarah.jpg"),
            ("James Wilson", "Principal Designer at Meta", "james.jpg"),
            ("Emma Thompson", "Design Lead at Apple", "emma.jpg"),
            ("Michael Chen", "Senior Designer at Microsoft", "michael.jpg"),
        };

        var speakerIds = new List<Guid>();
        foreach (var template in speakerTemplates)
        {
            var speaker = await _eventsDb.EventSpeakers
                .FirstOrDefaultAsync(s => s.Name == template.Name, cancellationToken);

            if (speaker is null)
            {
                speaker = new EventSpeaker
                {
                    Id = Guid.NewGuid(),
                    Name = template.Name,
                    Title = template.Title,
                    AvatarUrl = template.Avatar,
                    CreatedAt = DateTime.UtcNow,
                };
                _eventsDb.EventSpeakers.Add(speaker);
                await _eventsDb.SaveChangesAsync(cancellationToken);
            }

            speakerIds.Add(speaker.Id);

            var mapped = await _eventsDb.EventSpeakerMaps
                .FirstOrDefaultAsync(m => m.EventId == eventId && m.SpeakerId == speaker.Id, cancellationToken);

            if (mapped is null)
            {
                _eventsDb.EventSpeakerMaps.Add(new EventSpeakerMap
                {
                    Id = Guid.NewGuid(),
                    EventId = eventId,
                    SpeakerId = speaker.Id,
                    OrderIndex = speakerIds.Count,
                });
            }
        }

        var scheduleItems = new (string Time, string Title, string? Speaker)[]
        {
            ("9:00 AM", "Registration & Welcome Coffee", null),
            ("10:00 AM", "The Future of Design Systems", "Sarah Mitchell"),
            ("11:00 AM", "Building Accessible Components", "James Wilson"),
            ("12:00 PM", "Lunch Break", null),
            ("1:00 PM", "Design Tokens at Scale", "Emma Thompson"),
            ("2:00 PM", "Workshop: Component Architecture", "Michael Chen"),
            ("4:00 PM", "Panel Discussion & Q&A", "All Speakers"),
        };

        for (var i = 0; i < scheduleItems.Length; i++)
        {
            var item = scheduleItems[i];
            var exists = await _eventsDb.EventSchedule.AnyAsync(
                s => s.EventId == eventId && s.Title == item.Title,
                cancellationToken);

            if (exists)
            {
                continue;
            }

            _eventsDb.EventSchedule.Add(new EventScheduleItem
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                TimeLabel = item.Time,
                Title = item.Title,
                SpeakerName = item.Speaker,
                OrderIndex = i,
                CreatedAt = DateTime.UtcNow,
            });
        }

        await _eventsDb.SaveChangesAsync(cancellationToken);
    }
}
