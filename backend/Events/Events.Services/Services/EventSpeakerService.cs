using Events.Contracts.DTOs;
using Events.Contracts.Parameters.EventSpeaker;
using Events.Contracts.Results;
using Events.Contracts.Services;
using Events.DataAccess;
using Events.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Events.Services.Services;

public class EventSpeakerService(EventsDbContext dbContext) : IEventSpeakerService
{
    public async Task<EventSpeakerResult> CreateAsync(CreateEventSpeakerParameters parameters)
    {
        var name = parameters.Name?.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            return new EventSpeakerResult
            {
                Succeeded = false,
                Errors = ["Speaker name is required."]
            };
        }

        var entity = new EventSpeaker
        {
            Id = Guid.NewGuid(),
            Name = name,
            Title = Normalize(parameters.Title),
            AvatarUrl = Normalize(parameters.AvatarUrl),
            CreatedAt = DateTime.UtcNow
        };

        dbContext.EventSpeakers.Add(entity);
        await dbContext.SaveChangesAsync();

        return new EventSpeakerResult
        {
            Succeeded = true,
            EventSpeaker = Map(entity)
        };
    }

    public async Task<EventSpeakerDto?> GetByIdAsync(GetEventSpeakerByIdParameters parameters)
    {
        var entity = await dbContext.EventSpeakers
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == parameters.SpeakerId);

        return entity is null ? null : Map(entity);
    }

    public async Task<EventSpeakersPageResult> GetSpeakersAsync(
        GetEventSpeakersParameters parameters,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.EventSpeakers.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(parameters.Query))
        {
            var searchPattern = $"%{parameters.Query.Trim()}%";
            query = query.Where(x =>
                EF.Functions.ILike(x.Name, searchPattern) ||
                EF.Functions.ILike(x.Title ?? string.Empty, searchPattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var speakers = await query
            .OrderBy(x => x.Name)
            .Skip(parameters.Skip)
            .Take(parameters.Take)
            .ToListAsync(cancellationToken);

        return new EventSpeakersPageResult
        {
            Items = speakers.Select(Map).ToList(),
            TotalCount = totalCount
        };
    }

    public async Task<EventSpeakerResult> UpdateAsync(UpdateEventSpeakerParameters parameters)
    {
        var entity = await dbContext.EventSpeakers
            .FirstOrDefaultAsync(x => x.Id == parameters.SpeakerId);

        if (entity is null)
        {
            return new EventSpeakerResult
            {
                Succeeded = false,
                Errors = ["Speaker not found."]
            };
        }

        var name = parameters.Name?.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            return new EventSpeakerResult
            {
                Succeeded = false,
                Errors = ["Speaker name is required."]
            };
        }

        entity.Name = name;
        entity.Title = Normalize(parameters.Title);
        entity.AvatarUrl = Normalize(parameters.AvatarUrl);

        await dbContext.SaveChangesAsync();

        return new EventSpeakerResult
        {
            Succeeded = true,
            EventSpeaker = Map(entity)
        };
    }

    public async Task<EventSpeakerResult> DeleteAsync(DeleteEventSpeakerParameters parameters)
    {
        var entity = await dbContext.EventSpeakers
            .FirstOrDefaultAsync(x => x.Id == parameters.SpeakerId);

        if (entity is null)
        {
            return new EventSpeakerResult
            {
                Succeeded = false,
                Errors = ["Speaker not found."]
            };
        }

        var maps = await dbContext.EventSpeakerMaps
            .Where(x => x.SpeakerId == parameters.SpeakerId)
            .ToListAsync();

        if (maps.Count > 0)
            dbContext.EventSpeakerMaps.RemoveRange(maps);

        dbContext.EventSpeakers.Remove(entity);
        await dbContext.SaveChangesAsync();

        return new EventSpeakerResult
        {
            Succeeded = true
        };
    }

    private static EventSpeakerDto Map(EventSpeaker entity) =>
        new()
        {
            Id = entity.Id,
            Name = entity.Name,
            Title = entity.Title,
            AvatarUrl = entity.AvatarUrl,
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
