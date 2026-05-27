using Events.Contracts.DTOs;
using Events.Contracts.Parameters.Event;
using Events.Contracts.Results;
using Events.Contracts.Services;
using Events.DataAccess;
using Events.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Events.Services.Services;

public class EventService(EventsDbContext dbContext) : IEventService
{
    public async Task<EventResult> CreateAsync(CreateEventParameters parameters)
    {
        var organizerType = parameters.OrganizerType?.Trim();
        if (string.IsNullOrWhiteSpace(organizerType))
        {
            return new EventResult
            {
                Succeeded = false,
                Errors = ["Organizer type is required."]
            };
        }

        var title = parameters.Title?.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return new EventResult
            {
                Succeeded = false,
                Errors = ["Event title is required."]
            };
        }

        var now = DateTime.UtcNow;
        var visibility = string.IsNullOrWhiteSpace(parameters.Visibility) ? "public" : parameters.Visibility.Trim();

        var entity = new Event
        {
            Id = Guid.NewGuid(),
            OrganizerType = organizerType,
            OrganizerId = parameters.CurrentUserId,
            Title = title,
            Description = Normalize(parameters.Description),
            CoverImageUrl = Normalize(parameters.CoverImageUrl),
            Location = Normalize(parameters.Location),
            IsOnline = parameters.IsOnline,
            ExternalLink = Normalize(parameters.ExternalLink),
            Timezone = Normalize(parameters.Timezone),
            Visibility = visibility,
            AllowComments = parameters.AllowComments ?? true,
            StartAt = parameters.StartAt,
            EndAt = parameters.EndAt,
            CreatedAt = now,
            UpdatedAt = null,
            DeletedAt = null
        };

        dbContext.Events.Add(entity);
        await dbContext.SaveChangesAsync();

        return new EventResult
        {
            Succeeded = true,
            Event = Map(entity)
        };
    }

    public async Task<IReadOnlyCollection<EventDto>> GetMyEventsAsync(GetMyEventsParameters parameters)
    {
        var query = dbContext.Events
            .AsNoTracking()
            .Where(x => x.OrganizerId == parameters.CurrentUserId && x.DeletedAt == null);

        if (parameters.FromStartAt.HasValue)
            query = query.Where(x => x.StartAt >= parameters.FromStartAt.Value);

        if (parameters.ToStartAt.HasValue)
            query = query.Where(x => x.StartAt <= parameters.ToStartAt.Value);

        if (parameters.Limit.HasValue && parameters.Limit.Value > 0)
            query = query.Take(parameters.Limit.Value);

        var list = await query
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return list.Select(Map).ToList();
    }

    public async Task<EventDto?> GetByIdAsync(GetEventByIdParameters parameters)
    {
        var entity = await dbContext.Events
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == parameters.EventId && x.DeletedAt == null);

        return entity is null ? null : Map(entity);
    }

    public async Task<EventResult> UpdateAsync(UpdateEventParameters parameters)
    {
        var entity = await dbContext.Events
            .FirstOrDefaultAsync(x =>
                x.Id == parameters.EventId &&
                x.OrganizerId == parameters.CurrentUserId &&
                x.DeletedAt == null);

        if (entity is null)
        {
            return new EventResult
            {
                Succeeded = false,
                Errors = ["Event not found."]
            };
        }

        var title = parameters.Title?.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return new EventResult
            {
                Succeeded = false,
                Errors = ["Event title is required."]
            };
        }

        var organizerType = parameters.OrganizerType?.Trim();
        if (string.IsNullOrWhiteSpace(organizerType))
        {
            return new EventResult
            {
                Succeeded = false,
                Errors = ["Organizer type is required."]
            };
        }

        entity.OrganizerType = organizerType;
        entity.Title = title;
        entity.Description = Normalize(parameters.Description);
        entity.CoverImageUrl = Normalize(parameters.CoverImageUrl);
        entity.Location = Normalize(parameters.Location);
        entity.IsOnline = parameters.IsOnline;
        entity.ExternalLink = Normalize(parameters.ExternalLink);
        entity.Timezone = Normalize(parameters.Timezone);
        entity.Visibility = string.IsNullOrWhiteSpace(parameters.Visibility) ? "public" : parameters.Visibility.Trim();
        entity.AllowComments = parameters.AllowComments ?? true;
        entity.StartAt = parameters.StartAt;
        entity.EndAt = parameters.EndAt;
        entity.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return new EventResult
        {
            Succeeded = true,
            Event = Map(entity)
        };
    }

    public async Task<EventResult> DeleteAsync(DeleteEventParameters parameters)
    {
        var entity = await dbContext.Events
            .FirstOrDefaultAsync(x =>
                x.Id == parameters.EventId &&
                x.OrganizerId == parameters.CurrentUserId &&
                x.DeletedAt == null);

        if (entity is null)
        {
            return new EventResult
            {
                Succeeded = false,
                Errors = ["Event not found."]
            };
        }

        var now = DateTime.UtcNow;
        entity.DeletedAt = now;
        entity.UpdatedAt = now;

        await dbContext.SaveChangesAsync();

        return new EventResult
        {
            Succeeded = true,
            Event = Map(entity)
        };
    }

    private static EventDto Map(Event entity) =>
        new()
        {
            Id = entity.Id,
            OrganizerType = entity.OrganizerType,
            OrganizerId = entity.OrganizerId,
            Title = entity.Title,
            Description = entity.Description,
            CoverImageUrl = entity.CoverImageUrl,
            Location = entity.Location,
            IsOnline = entity.IsOnline,
            ExternalLink = entity.ExternalLink,
            Timezone = entity.Timezone,
            Visibility = entity.Visibility,
            AllowComments = entity.AllowComments,
            StartAt = entity.StartAt,
            EndAt = entity.EndAt,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };

    private static string? Normalize(string? value)
    {
        if (value is null)
            return null;

        var trimmed = value.Trim();
        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }
}
