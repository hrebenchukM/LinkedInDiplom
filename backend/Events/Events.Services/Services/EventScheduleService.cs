using Events.Contracts.DTOs;
using Events.Contracts.Parameters.EventSchedule;
using Events.Contracts.Results;
using Events.Contracts.Services;
using Events.DataAccess;
using Events.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Events.Services.Services;

public class EventScheduleService(EventsDbContext dbContext) : IEventScheduleService
{
    public async Task<EventScheduleResult> CreateAsync(CreateEventScheduleParameters parameters)
    {
        var ownsEvent = await dbContext.Events
            .AsNoTracking()
            .AnyAsync(x =>
                x.Id == parameters.EventId &&
                x.DeletedAt == null &&
                x.OrganizerId == parameters.CurrentUserId);

        if (!ownsEvent)
        {
            return new EventScheduleResult
            {
                Succeeded = false,
                Errors = ["Event not found."]
            };
        }

        var title = parameters.Title?.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return new EventScheduleResult
            {
                Succeeded = false,
                Errors = ["Schedule title is required."]
            };
        }

        var entity = new EventScheduleItem
        {
            Id = Guid.NewGuid(),
            EventId = parameters.EventId,
            TimeLabel = Normalize(parameters.TimeLabel),
            Title = title,
            SpeakerName = Normalize(parameters.SpeakerName),
            OrderIndex = parameters.OrderIndex,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.EventSchedule.Add(entity);
        await dbContext.SaveChangesAsync();

        return new EventScheduleResult
        {
            Succeeded = true,
            EventSchedule = Map(entity)
        };
    }

    public async Task<IReadOnlyCollection<EventScheduleDto>> GetByEventIdAsync(GetEventScheduleParameters parameters)
    {
        var eventExists = await dbContext.Events
            .AsNoTracking()
            .AnyAsync(x => x.Id == parameters.EventId && x.DeletedAt == null);

        if (!eventExists)
            return [];

        var list = await dbContext.EventSchedule
            .AsNoTracking()
            .Where(x => x.EventId == parameters.EventId)
            .OrderBy(x => x.OrderIndex)
            .ToListAsync();

        return list.Select(Map).ToList();
    }

    public async Task<EventScheduleResult> UpdateAsync(UpdateEventScheduleParameters parameters)
    {
        var eventExists = await dbContext.Events
            .AsNoTracking()
            .AnyAsync(x =>
                x.Id == parameters.EventId &&
                x.DeletedAt == null &&
                x.OrganizerId == parameters.CurrentUserId);

        if (!eventExists)
        {
            return new EventScheduleResult
            {
                Succeeded = false,
                Errors = ["Event not found."]
            };
        }

        var schedule = await dbContext.EventSchedule
            .FirstOrDefaultAsync(x => x.Id == parameters.ScheduleId && x.EventId == parameters.EventId);

        if (schedule is null)
        {
            return new EventScheduleResult
            {
                Succeeded = false,
                Errors = ["Schedule item not found."]
            };
        }

        var title = parameters.Title?.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return new EventScheduleResult
            {
                Succeeded = false,
                Errors = ["Schedule title is required."]
            };
        }

        schedule.TimeLabel = Normalize(parameters.TimeLabel);
        schedule.Title = title;
        schedule.SpeakerName = Normalize(parameters.SpeakerName);
        schedule.OrderIndex = parameters.OrderIndex;

        await dbContext.SaveChangesAsync();

        return new EventScheduleResult
        {
            Succeeded = true,
            EventSchedule = Map(schedule)
        };
    }

    public async Task<EventScheduleResult> DeleteAsync(DeleteEventScheduleParameters parameters)
    {
        var eventExists = await dbContext.Events
            .AsNoTracking()
            .AnyAsync(x =>
                x.Id == parameters.EventId &&
                x.DeletedAt == null &&
                x.OrganizerId == parameters.CurrentUserId);

        if (!eventExists)
        {
            return new EventScheduleResult
            {
                Succeeded = false,
                Errors = ["Event not found."]
            };
        }

        var schedule = await dbContext.EventSchedule
            .FirstOrDefaultAsync(x => x.Id == parameters.ScheduleId && x.EventId == parameters.EventId);

        if (schedule is null)
        {
            return new EventScheduleResult
            {
                Succeeded = false,
                Errors = ["Schedule item not found."]
            };
        }

        dbContext.EventSchedule.Remove(schedule);
        await dbContext.SaveChangesAsync();

        return new EventScheduleResult
        {
            Succeeded = true
        };
    }

    private static EventScheduleDto Map(EventScheduleItem entity) =>
        new()
        {
            Id = entity.Id,
            EventId = entity.EventId,
            TimeLabel = entity.TimeLabel,
            Title = entity.Title,
            SpeakerName = entity.SpeakerName,
            OrderIndex = entity.OrderIndex,
            CreatedAt = entity.CreatedAt
        };

    private static string? Normalize(string? value)
    {
        if (value is null)
            return null;

        var trimmed = value.Trim();
        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }
}
