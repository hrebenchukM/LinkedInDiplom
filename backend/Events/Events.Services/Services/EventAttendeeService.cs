using Events.Contracts.DTOs;
using Events.Contracts.Parameters.EventAttendee;
using Events.Contracts.Results;
using Events.Contracts.Services;
using Events.DataAccess;
using Events.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Events.Services.Services;

public class EventAttendeeService(EventsDbContext dbContext) : IEventAttendeeService
{
    public async Task<EventAttendeeResult> JoinAsync(JoinEventParameters parameters)
    {
        var eventExists = await dbContext.Events
            .AsNoTracking()
            .AnyAsync(x => x.Id == parameters.EventId && x.DeletedAt == null);

        if (!eventExists)
        {
            return new EventAttendeeResult
            {
                Succeeded = false,
                Errors = ["Event not found."]
            };
        }

        var existing = await dbContext.EventAttendees
            .FirstOrDefaultAsync(x => x.EventId == parameters.EventId && x.UserId == parameters.CurrentUserId);

        if (existing is not null && existing.DeletedAt is null)
        {
            return new EventAttendeeResult
            {
                Succeeded = false,
                Errors = ["Already joined this event."]
            };
        }

        if (existing is not null)
        {
            existing.DeletedAt = null;
            existing.Status = "joined";
            existing.UpdatedAt = DateTime.UtcNow;
            existing.JoinedAt = DateTime.UtcNow;

            await dbContext.SaveChangesAsync();

            return new EventAttendeeResult
            {
                Succeeded = true,
                EventAttendee = Map(existing)
            };
        }

        var attendee = new EventAttendee
        {
            Id = Guid.NewGuid(),
            EventId = parameters.EventId,
            UserId = parameters.CurrentUserId,
            Status = "joined",
            JoinedAt = DateTime.UtcNow,
            UpdatedAt = null,
            DeletedAt = null
        };

        dbContext.EventAttendees.Add(attendee);
        await dbContext.SaveChangesAsync();

        return new EventAttendeeResult
        {
            Succeeded = true,
            EventAttendee = Map(attendee)
        };
    }

    public async Task<EventAttendeeResult> LeaveAsync(LeaveEventParameters parameters)
    {
        var attendee = await dbContext.EventAttendees
            .FirstOrDefaultAsync(x =>
                x.EventId == parameters.EventId &&
                x.UserId == parameters.CurrentUserId &&
                x.DeletedAt == null);

        if (attendee is null)
        {
            return new EventAttendeeResult
            {
                Succeeded = false,
                Errors = ["Event attendee not found."]
            };
        }

        var now = DateTime.UtcNow;
        attendee.DeletedAt = now;
        attendee.UpdatedAt = now;
        attendee.Status = "left";

        await dbContext.SaveChangesAsync();

        return new EventAttendeeResult
        {
            Succeeded = true,
            EventAttendee = Map(attendee)
        };
    }

    public async Task<IReadOnlyCollection<EventAttendeeDto>> GetEventAttendeesAsync(GetEventAttendeesParameters parameters)
    {
        var eventExists = await dbContext.Events
            .AsNoTracking()
            .AnyAsync(x => x.Id == parameters.EventId && x.DeletedAt == null);

        if (!eventExists)
            return [];

        var query = dbContext.EventAttendees
            .AsNoTracking()
            .Where(x => x.EventId == parameters.EventId && x.DeletedAt == null)
            .OrderByDescending(x => x.JoinedAt);

        if (parameters.Limit.HasValue && parameters.Limit.Value > 0)
            query = (IOrderedQueryable<EventAttendee>)query.Take(parameters.Limit.Value);

        var attendees = await query.ToListAsync();
        return attendees.Select(Map).ToList();
    }

    public async Task<IReadOnlyCollection<Guid>> GetUserAttendingEventIdsAsync(
        GetUserAttendingEventIdsParameters parameters,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.EventAttendees
            .AsNoTracking()
            .Where(x => x.UserId == parameters.UserId && x.DeletedAt == null)
            .Select(x => x.EventId)
            .ToListAsync(cancellationToken);
    }

    private static EventAttendeeDto Map(EventAttendee entity) =>
        new()
        {
            Id = entity.Id,
            EventId = entity.EventId,
            UserId = entity.UserId,
            Status = entity.Status,
            JoinedAt = entity.JoinedAt,
            UpdatedAt = entity.UpdatedAt
        };
}
