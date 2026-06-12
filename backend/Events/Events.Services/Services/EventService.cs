using Events.Contracts.DTOs;
using Events.Contracts.Parameters.Event;
using Events.Contracts.Results;
using Events.Contracts.Services;
using Events.DataAccess;
using Events.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Events.Services.Services;

/// <summary>
/// Core service модуля Events.
/// Отвечает за CRUD событий и проверки владельца-организатора.
/// </summary>
public class EventService(EventsDbContext dbContext) : IEventService
{
    private const string VisibilityPublic = "public";
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

        var attendeeCounts = await GetAttendeeCountsByEventIdsAsync(list.Select(x => x.Id));

        return list
            .Select(x => Map(x, attendeeCounts.GetValueOrDefault(x.Id)))
            .ToList();
    }

    public async Task<EventsPageResult> DiscoverEventsAsync(
        DiscoverEventsParameters parameters,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var query = dbContext.Events
            .AsNoTracking()
            .Where(x => x.DeletedAt == null && x.Visibility == VisibilityPublic);

        if (parameters.FromStartAt.HasValue)
        {
            query = query.Where(x => x.StartAt >= parameters.FromStartAt.Value);
        }
        else
        {
            query = query.Where(x => x.StartAt >= now);
        }

        if (parameters.ToStartAt.HasValue)
        {
            query = query.Where(x => x.StartAt <= parameters.ToStartAt.Value);
        }

        if (!string.IsNullOrWhiteSpace(parameters.OrganizerUserId))
        {
            var organizerUserId = parameters.OrganizerUserId.Trim();
            query = query.Where(x => x.OrganizerId == organizerUserId);
        }

        if (!string.IsNullOrWhiteSpace(parameters.Location))
        {
            var locationPattern = $"%{parameters.Location.Trim()}%";
            query = query.Where(x => EF.Functions.ILike(x.Location ?? string.Empty, locationPattern));
        }

        if (parameters.IsOnline.HasValue)
        {
            query = query.Where(x => x.IsOnline == parameters.IsOnline.Value);
        }

        if (!string.IsNullOrWhiteSpace(parameters.Query))
        {
            var searchPattern = $"%{parameters.Query.Trim()}%";
            query = query.Where(x =>
                EF.Functions.ILike(x.Title, searchPattern) ||
                EF.Functions.ILike(x.Description ?? string.Empty, searchPattern) ||
                EF.Functions.ILike(x.Location ?? string.Empty, searchPattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var events = await query
            .OrderBy(x => x.StartAt)
            .Skip(parameters.Skip)
            .Take(parameters.Take)
            .ToListAsync(cancellationToken);

        var attendeeCounts = await GetAttendeeCountsByEventIdsAsync(
            events.Select(x => x.Id),
            cancellationToken);

        return new EventsPageResult
        {
            Items = events
                .Select(x => Map(x, attendeeCounts.GetValueOrDefault(x.Id)))
                .ToList(),
            TotalCount = totalCount
        };
    }

    public async Task<EventsPageResult> GetAttendingEventsAsync(
        GetAttendingEventsParameters parameters,
        CancellationToken cancellationToken = default)
    {
        var query =
            from attendee in dbContext.EventAttendees.AsNoTracking()
            join entity in dbContext.Events.AsNoTracking() on attendee.EventId equals entity.Id
            where attendee.UserId == parameters.CurrentUserId
                  && attendee.DeletedAt == null
                  && entity.DeletedAt == null
            select entity;

        if (parameters.FromStartAt.HasValue)
        {
            query = query.Where(x => x.StartAt >= parameters.FromStartAt.Value);
        }

        if (parameters.ToStartAt.HasValue)
        {
            query = query.Where(x => x.StartAt <= parameters.ToStartAt.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var events = await query
            .OrderBy(x => x.StartAt)
            .Skip(parameters.Skip)
            .Take(parameters.Take)
            .ToListAsync(cancellationToken);

        var attendeeCounts = await GetAttendeeCountsByEventIdsAsync(
            events.Select(x => x.Id),
            cancellationToken);

        return new EventsPageResult
        {
            Items = events
                .Select(x => Map(x, attendeeCounts.GetValueOrDefault(x.Id)))
                .ToList(),
            TotalCount = totalCount
        };
    }

    public async Task<EventDto?> GetByIdAsync(GetEventByIdParameters parameters)
    {
        var entity = await dbContext.Events
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == parameters.EventId && x.DeletedAt == null);

        if (entity is null)
        {
            return null;
        }

        var attendeeCounts = await GetAttendeeCountsByEventIdsAsync([entity.Id]);

        return Map(entity, attendeeCounts.GetValueOrDefault(entity.Id));
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

    public async Task AdminSoftDeleteEventAsync(
        Guid eventId,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Events
            .FirstOrDefaultAsync(x => x.Id == eventId, cancellationToken);

        if (entity is null)
        {
            throw new InvalidOperationException($"Event with id '{eventId}' was not found.");
        }

        if (entity.DeletedAt != null)
        {
            return;
        }

        var now = DateTime.UtcNow;
        entity.DeletedAt = now;
        entity.UpdatedAt = now;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AdminRestoreEventAsync(
        Guid eventId,
        CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Events
            .FirstOrDefaultAsync(x => x.Id == eventId, cancellationToken);

        if (entity is null)
        {
            throw new InvalidOperationException($"Event with id '{eventId}' was not found.");
        }

        if (entity.DeletedAt == null)
        {
            return;
        }

        entity.DeletedAt = null;
        entity.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<AdminEventsResult> GetAdminEventsAsync(
        GetAdminEventsParameters parameters,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Events.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(parameters.OrganizerUserId))
        {
            var organizerUserId = parameters.OrganizerUserId.Trim();
            query = query.Where(x => x.OrganizerId == organizerUserId);
        }

        if (parameters.IsDeleted == true)
        {
            query = query.Where(x => x.DeletedAt != null);
        }
        else if (parameters.IsDeleted == false)
        {
            query = query.Where(x => x.DeletedAt == null);
        }
        else if (parameters.IncludeDeleted == false)
        {
            query = query.Where(x => x.DeletedAt == null);
        }

        if (!string.IsNullOrWhiteSpace(parameters.Query))
        {
            var searchPattern = $"%{parameters.Query.Trim()}%";
            query = query.Where(x =>
                EF.Functions.ILike(x.Title, searchPattern) ||
                EF.Functions.ILike(x.Description ?? string.Empty, searchPattern) ||
                EF.Functions.ILike(x.Location ?? string.Empty, searchPattern));
        }

        if (parameters.FromStartAt.HasValue)
        {
            query = query.Where(x => x.StartAt >= parameters.FromStartAt.Value);
        }

        if (parameters.ToStartAt.HasValue)
        {
            query = query.Where(x => x.StartAt <= parameters.ToStartAt.Value);
        }

        if (!string.IsNullOrWhiteSpace(parameters.Location))
        {
            var locationPattern = $"%{parameters.Location.Trim()}%";
            query = query.Where(x => EF.Functions.ILike(x.Location ?? string.Empty, locationPattern));
        }

        if (parameters.IsOnline.HasValue)
        {
            query = query.Where(x => x.IsOnline == parameters.IsOnline.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var sortBy = string.IsNullOrWhiteSpace(parameters.SortBy)
            ? "createdAt"
            : parameters.SortBy.Trim();
        var descending = !string.Equals(parameters.SortDirection, "asc", StringComparison.OrdinalIgnoreCase);

        query = ApplyAdminSorting(query, sortBy, descending);

        var events = await query
            .Skip(parameters.Skip)
            .Take(parameters.Take)
            .ToListAsync(cancellationToken);

        var attendeeCounts = await GetAttendeeCountsByEventIdsAsync(
            events.Select(x => x.Id),
            cancellationToken);

        return new AdminEventsResult
        {
            Items = events
                .Select(x => MapToAdminDto(x, attendeeCounts.GetValueOrDefault(x.Id)))
                .ToList(),
            TotalCount = totalCount
        };
    }

    public async Task<EventsStatsDto> GetEventsStatsAsync(
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var totalEvents = await dbContext.Events.CountAsync(cancellationToken);
        var deletedEvents = await dbContext.Events.CountAsync(
            x => x.DeletedAt != null,
            cancellationToken);
        var upcomingEvents = await dbContext.Events.CountAsync(
            x => x.DeletedAt == null && x.StartAt >= now,
            cancellationToken);

        return new EventsStatsDto
        {
            TotalEvents = totalEvents,
            DeletedEvents = deletedEvents,
            ActiveEvents = totalEvents - deletedEvents,
            UpcomingEvents = upcomingEvents
        };
    }

    private IQueryable<Event> ApplyAdminSorting(
        IQueryable<Event> query,
        string sortBy,
        bool descending)
    {
        return sortBy.ToLowerInvariant() switch
        {
            "startat" when descending => query.OrderByDescending(x => x.StartAt),
            "startat" => query.OrderBy(x => x.StartAt),
            "title" when descending => query.OrderByDescending(x => x.Title),
            "title" => query.OrderBy(x => x.Title),
            "updatedat" when descending => query.OrderByDescending(x => x.UpdatedAt),
            "updatedat" => query.OrderBy(x => x.UpdatedAt),
            "deletedat" when descending => query.OrderByDescending(x => x.DeletedAt),
            "deletedat" => query.OrderBy(x => x.DeletedAt),
            "attendeecount" when descending => query.OrderByDescending(x =>
                dbContext.EventAttendees.Count(a => a.EventId == x.Id && a.DeletedAt == null)),
            "attendeecount" => query.OrderBy(x =>
                dbContext.EventAttendees.Count(a => a.EventId == x.Id && a.DeletedAt == null)),
            "createdat" when descending => query.OrderByDescending(x => x.CreatedAt),
            "createdat" => query.OrderBy(x => x.CreatedAt),
            _ when descending => query.OrderByDescending(x => x.CreatedAt),
            _ => query.OrderBy(x => x.CreatedAt)
        };
    }

    private static AdminEventDto MapToAdminDto(Event entity, int attendeeCount) =>
        new()
        {
            Id = entity.Id,
            OrganizerUserId = entity.OrganizerId,
            Title = entity.Title,
            StartAt = entity.StartAt,
            EndAt = entity.EndAt,
            Location = entity.Location,
            IsOnline = entity.IsOnline,
            AttendeeCount = attendeeCount,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            DeletedAt = entity.DeletedAt,
            IsDeleted = entity.DeletedAt != null
        };

    private async Task<IReadOnlyDictionary<Guid, int>> GetAttendeeCountsByEventIdsAsync(
        IEnumerable<Guid> eventIds,
        CancellationToken cancellationToken = default)
    {
        var ids = eventIds.Distinct().ToList();

        if (ids.Count == 0)
        {
            return new Dictionary<Guid, int>();
        }

        return await dbContext.EventAttendees
            .AsNoTracking()
            .Where(x => ids.Contains(x.EventId) && x.DeletedAt == null)
            .GroupBy(x => x.EventId)
            .Select(g => new { EventId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.EventId, x => x.Count, cancellationToken);
    }

    private static EventDto Map(Event entity, int attendeeCount = 0) =>
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
            UpdatedAt = entity.UpdatedAt,
            AttendeeCount = attendeeCount
        };

    private static string? Normalize(string? value)
    {
        if (value is null)
            return null;

        var trimmed = value.Trim();
        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }
}
