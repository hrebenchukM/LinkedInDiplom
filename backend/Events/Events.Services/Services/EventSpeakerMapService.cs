using Events.Contracts.DTOs;
using Events.Contracts.Parameters.EventSpeakerMap;
using Events.Contracts.Results;
using Events.Contracts.Services;
using Events.DataAccess;
using Events.DataAccess.Entities;
using Microsoft.EntityFrameworkCore;

namespace Events.Services.Services;

public class EventSpeakerMapService(EventsDbContext dbContext) : IEventSpeakerMapService
{
    public async Task<EventSpeakerMapResult> AttachAsync(AttachSpeakerToEventParameters parameters)
    {
        var ownsEvent = await dbContext.Events
            .AsNoTracking()
            .AnyAsync(x =>
                x.Id == parameters.EventId &&
                x.DeletedAt == null &&
                x.OrganizerId == parameters.CurrentUserId);

        if (!ownsEvent)
        {
            return new EventSpeakerMapResult
            {
                Succeeded = false,
                Errors = ["Event not found."]
            };
        }

        var speakerExists = await dbContext.EventSpeakers
            .AsNoTracking()
            .AnyAsync(x => x.Id == parameters.SpeakerId);

        if (!speakerExists)
        {
            return new EventSpeakerMapResult
            {
                Succeeded = false,
                Errors = ["Speaker not found."]
            };
        }

        var duplicate = await dbContext.EventSpeakerMaps
            .AsNoTracking()
            .AnyAsync(x => x.EventId == parameters.EventId && x.SpeakerId == parameters.SpeakerId);

        if (duplicate)
        {
            return new EventSpeakerMapResult
            {
                Succeeded = false,
                Errors = ["Speaker already attached to event."]
            };
        }

        var map = new EventSpeakerMap
        {
            Id = Guid.NewGuid(),
            EventId = parameters.EventId,
            SpeakerId = parameters.SpeakerId,
            OrderIndex = parameters.OrderIndex
        };

        dbContext.EventSpeakerMaps.Add(map);
        await dbContext.SaveChangesAsync();

        var speaker = await dbContext.EventSpeakers
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == map.SpeakerId);

        return new EventSpeakerMapResult
        {
            Succeeded = true,
            EventSpeakerMap = Map(map, speaker)
        };
    }

    public async Task<EventSpeakerMapResult> DetachAsync(DetachSpeakerFromEventParameters parameters)
    {
        var ownsEvent = await dbContext.Events
            .AsNoTracking()
            .AnyAsync(x =>
                x.Id == parameters.EventId &&
                x.DeletedAt == null &&
                x.OrganizerId == parameters.CurrentUserId);

        if (!ownsEvent)
        {
            return new EventSpeakerMapResult
            {
                Succeeded = false,
                Errors = ["Event not found."]
            };
        }

        var map = await dbContext.EventSpeakerMaps
            .FirstOrDefaultAsync(x => x.EventId == parameters.EventId && x.SpeakerId == parameters.SpeakerId);

        if (map is null)
        {
            return new EventSpeakerMapResult
            {
                Succeeded = false,
                Errors = ["Event speaker not found."]
            };
        }

        dbContext.EventSpeakerMaps.Remove(map);
        await dbContext.SaveChangesAsync();

        return new EventSpeakerMapResult
        {
            Succeeded = true
        };
    }

    public async Task<IReadOnlyCollection<EventSpeakerMapDto>> GetByEventIdAsync(GetEventSpeakersParameters parameters)
    {
        var eventExists = await dbContext.Events
            .AsNoTracking()
            .AnyAsync(x => x.Id == parameters.EventId && x.DeletedAt == null);

        if (!eventExists)
            return [];

        var maps = await dbContext.EventSpeakerMaps
            .AsNoTracking()
            .Where(x => x.EventId == parameters.EventId)
            .OrderBy(x => x.OrderIndex)
            .ToListAsync();

        if (maps.Count == 0)
            return [];

        var speakerIds = maps.Select(x => x.SpeakerId).Distinct().ToList();
        var speakers = await dbContext.EventSpeakers
            .AsNoTracking()
            .Where(x => speakerIds.Contains(x.Id))
            .ToListAsync();

        var speakerLookup = speakers.ToDictionary(x => x.Id, x => x);

        return maps
            .Select(map =>
            {
                speakerLookup.TryGetValue(map.SpeakerId, out var speaker);
                return Map(map, speaker);
            })
            .ToList();
    }

    private static EventSpeakerMapDto Map(EventSpeakerMap map, EventSpeaker? speaker) =>
        new()
        {
            Id = map.Id,
            EventId = map.EventId,
            SpeakerId = map.SpeakerId,
            OrderIndex = map.OrderIndex,
            Speaker = speaker is null
                ? null
                : new EventSpeakerDto
                {
                    Id = speaker.Id,
                    Name = speaker.Name,
                    Title = speaker.Title,
                    AvatarUrl = speaker.AvatarUrl,
                    CreatedAt = speaker.CreatedAt
                }
        };
}
