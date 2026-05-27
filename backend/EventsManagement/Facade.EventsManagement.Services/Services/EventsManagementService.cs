using Events.Client.Contracts;
using Events.Contracts.Parameters.Event;
using Events.Contracts.Parameters.EventAttendee;
using Events.Contracts.Parameters.EventSchedule;
using Events.Contracts.Parameters.EventSpeaker;
using Events.Contracts.Parameters.EventSpeakerMap;
using EventsCoreAttendeeDto = Events.Contracts.DTOs.EventAttendeeDto;
using EventsCoreAttendeeResult = Events.Contracts.Results.EventAttendeeResult;
using EventsCoreEventDto = Events.Contracts.DTOs.EventDto;
using EventsCoreEventResult = Events.Contracts.Results.EventResult;
using EventsCoreScheduleDto = Events.Contracts.DTOs.EventScheduleDto;
using EventsCoreScheduleResult = Events.Contracts.Results.EventScheduleResult;
using EventsCoreSpeakerDto = Events.Contracts.DTOs.EventSpeakerDto;
using EventsCoreSpeakerMapDto = Events.Contracts.DTOs.EventSpeakerMapDto;
using EventsCoreSpeakerMapResult = Events.Contracts.Results.EventSpeakerMapResult;
using EventsCoreSpeakerResult = Events.Contracts.Results.EventSpeakerResult;
using Facade.EventsManagement.Contracts.DTOs;
using Facade.EventsManagement.Contracts.Requests.Event;
using Facade.EventsManagement.Contracts.Requests.EventSchedule;
using Facade.EventsManagement.Contracts.Requests.EventSpeaker;
using Facade.EventsManagement.Contracts.Requests.EventSpeakerMap;
using Facade.EventsManagement.Contracts.Responses;
using Facade.EventsManagement.Contracts.Services;

namespace Facade.EventsManagement.Services.Services;

public class EventsManagementService(IEventsClient eventsClient) : IEventsManagementService
{
    public async Task<EventResponse> CreateEventAsync(string userId, CreateEventRequest request)
    {
        var result = await eventsClient.Events.CreateAsync(new CreateEventParameters
        {
            CurrentUserId = userId,
            OrganizerType = request.OrganizerType,
            Title = request.Title,
            Description = request.Description,
            CoverImageUrl = request.CoverImageUrl,
            Location = request.Location,
            IsOnline = request.IsOnline,
            ExternalLink = request.ExternalLink,
            Timezone = request.Timezone,
            Visibility = request.Visibility,
            AllowComments = request.AllowComments,
            StartAt = request.StartAt,
            EndAt = request.EndAt
        });

        return Map(result);
    }

    public async Task<IReadOnlyCollection<EventDto>> GetMyEventsAsync(string userId, int? limit, DateTime? fromStartAt, DateTime? toStartAt)
    {
        var events = await eventsClient.Events.GetMyEventsAsync(new GetMyEventsParameters
        {
            CurrentUserId = userId,
            Limit = limit,
            FromStartAt = fromStartAt,
            ToStartAt = toStartAt
        });

        return events.Select(Map).ToList();
    }

    public async Task<EventDto?> GetEventByIdAsync(Guid eventId)
    {
        var entity = await eventsClient.Events.GetByIdAsync(new GetEventByIdParameters
        {
            CurrentUserId = string.Empty,
            EventId = eventId
        });

        return entity is null ? null : Map(entity);
    }

    public async Task<EventResponse> UpdateEventAsync(string userId, Guid eventId, UpdateEventRequest request)
    {
        var result = await eventsClient.Events.UpdateAsync(new UpdateEventParameters
        {
            CurrentUserId = userId,
            EventId = eventId,
            OrganizerType = request.OrganizerType,
            Title = request.Title,
            Description = request.Description,
            CoverImageUrl = request.CoverImageUrl,
            Location = request.Location,
            IsOnline = request.IsOnline,
            ExternalLink = request.ExternalLink,
            Timezone = request.Timezone,
            Visibility = request.Visibility,
            AllowComments = request.AllowComments,
            StartAt = request.StartAt,
            EndAt = request.EndAt
        });

        return Map(result);
    }

    public async Task<EventResponse> DeleteEventAsync(string userId, Guid eventId)
    {
        var result = await eventsClient.Events.DeleteAsync(new DeleteEventParameters
        {
            CurrentUserId = userId,
            EventId = eventId
        });

        return Map(result);
    }

    public async Task<EventAttendeeResponse> JoinEventAsync(string userId, Guid eventId)
    {
        var result = await eventsClient.Attendees.JoinAsync(new JoinEventParameters
        {
            CurrentUserId = userId,
            EventId = eventId,
            Status = "joined"
        });

        return Map(result);
    }

    public async Task<EventAttendeeResponse> LeaveEventAsync(string userId, Guid eventId)
    {
        var result = await eventsClient.Attendees.LeaveAsync(new LeaveEventParameters
        {
            CurrentUserId = userId,
            EventId = eventId
        });

        return Map(result);
    }

    public async Task<IReadOnlyCollection<EventAttendeeDto>> GetEventAttendeesAsync(Guid eventId, int? limit)
    {
        var attendees = await eventsClient.Attendees.GetEventAttendeesAsync(new GetEventAttendeesParameters
        {
            CurrentUserId = string.Empty,
            EventId = eventId,
            Limit = limit
        });

        return attendees.Select(Map).ToList();
    }

    public async Task<EventScheduleResponse> CreateScheduleItemAsync(string userId, Guid eventId, CreateEventScheduleRequest request)
    {
        var result = await eventsClient.Schedule.CreateAsync(new CreateEventScheduleParameters
        {
            CurrentUserId = userId,
            EventId = eventId,
            TimeLabel = request.TimeLabel,
            Title = request.Title,
            SpeakerName = request.SpeakerName,
            OrderIndex = request.OrderIndex
        });

        return Map(result);
    }

    public async Task<IReadOnlyCollection<EventScheduleDto>> GetEventScheduleAsync(Guid eventId)
    {
        var schedule = await eventsClient.Schedule.GetByEventIdAsync(new GetEventScheduleParameters
        {
            CurrentUserId = string.Empty,
            EventId = eventId
        });

        return schedule.Select(Map).ToList();
    }

    public async Task<EventScheduleResponse> UpdateScheduleItemAsync(string userId, Guid eventId, Guid scheduleId, UpdateEventScheduleRequest request)
    {
        var result = await eventsClient.Schedule.UpdateAsync(new UpdateEventScheduleParameters
        {
            CurrentUserId = userId,
            EventId = eventId,
            ScheduleId = scheduleId,
            TimeLabel = request.TimeLabel,
            Title = request.Title,
            SpeakerName = request.SpeakerName,
            OrderIndex = request.OrderIndex
        });

        return Map(result);
    }

    public async Task<EventScheduleResponse> DeleteScheduleItemAsync(string userId, Guid eventId, Guid scheduleId)
    {
        var result = await eventsClient.Schedule.DeleteAsync(new DeleteEventScheduleParameters
        {
            CurrentUserId = userId,
            EventId = eventId,
            ScheduleId = scheduleId
        });

        return Map(result);
    }

    public async Task<EventSpeakerResponse> CreateSpeakerAsync(string userId, CreateEventSpeakerRequest request)
    {
        var result = await eventsClient.Speakers.CreateAsync(new CreateEventSpeakerParameters
        {
            CurrentUserId = userId,
            Name = request.Name,
            Title = request.Title,
            AvatarUrl = request.AvatarUrl
        });

        return Map(result);
    }

    public async Task<EventSpeakerDto?> GetSpeakerByIdAsync(string userId, Guid speakerId)
    {
        var speaker = await eventsClient.Speakers.GetByIdAsync(new GetEventSpeakerByIdParameters
        {
            CurrentUserId = userId,
            SpeakerId = speakerId
        });

        return speaker is null ? null : Map(speaker);
    }

    public async Task<EventSpeakerResponse> UpdateSpeakerAsync(string userId, Guid speakerId, UpdateEventSpeakerRequest request)
    {
        var result = await eventsClient.Speakers.UpdateAsync(new UpdateEventSpeakerParameters
        {
            CurrentUserId = userId,
            SpeakerId = speakerId,
            Name = request.Name,
            Title = request.Title,
            AvatarUrl = request.AvatarUrl
        });

        return Map(result);
    }

    public async Task<EventSpeakerResponse> DeleteSpeakerAsync(string userId, Guid speakerId)
    {
        var result = await eventsClient.Speakers.DeleteAsync(new DeleteEventSpeakerParameters
        {
            CurrentUserId = userId,
            SpeakerId = speakerId
        });

        return Map(result);
    }

    public async Task<EventSpeakerMapResponse> AttachSpeakerToEventAsync(string userId, Guid eventId, AttachSpeakerToEventRequest request)
    {
        var result = await eventsClient.SpeakerMap.AttachAsync(new AttachSpeakerToEventParameters
        {
            CurrentUserId = userId,
            EventId = eventId,
            SpeakerId = request.SpeakerId,
            OrderIndex = request.OrderIndex
        });

        return Map(result);
    }

    public async Task<EventSpeakerMapResponse> DetachSpeakerFromEventAsync(string userId, Guid eventId, Guid speakerId)
    {
        var result = await eventsClient.SpeakerMap.DetachAsync(new DetachSpeakerFromEventParameters
        {
            CurrentUserId = userId,
            EventId = eventId,
            SpeakerId = speakerId
        });

        return Map(result);
    }

    public async Task<IReadOnlyCollection<EventSpeakerMapDto>> GetEventSpeakersAsync(Guid eventId)
    {
        var maps = await eventsClient.SpeakerMap.GetByEventIdAsync(new GetEventSpeakersParameters
        {
            CurrentUserId = string.Empty,
            EventId = eventId
        });

        return maps.Select(Map).ToList();
    }

    private static EventResponse Map(EventsCoreEventResult result) =>
        new()
        {
            Success = result.Succeeded,
            Event = result.Event is null ? null : Map(result.Event),
            Errors = result.Errors
        };

    private static EventAttendeeResponse Map(EventsCoreAttendeeResult result) =>
        new()
        {
            Success = result.Succeeded,
            EventAttendee = result.EventAttendee is null ? null : Map(result.EventAttendee),
            Errors = result.Errors
        };

    private static EventScheduleResponse Map(EventsCoreScheduleResult result) =>
        new()
        {
            Success = result.Succeeded,
            EventSchedule = result.EventSchedule is null ? null : Map(result.EventSchedule),
            Errors = result.Errors
        };

    private static EventSpeakerResponse Map(EventsCoreSpeakerResult result) =>
        new()
        {
            Success = result.Succeeded,
            EventSpeaker = result.EventSpeaker is null ? null : Map(result.EventSpeaker),
            Errors = result.Errors
        };

    private static EventSpeakerMapResponse Map(EventsCoreSpeakerMapResult result) =>
        new()
        {
            Success = result.Succeeded,
            EventSpeakerMap = result.EventSpeakerMap is null ? null : Map(result.EventSpeakerMap),
            Errors = result.Errors
        };

    private static EventDto Map(EventsCoreEventDto dto) =>
        new()
        {
            Id = dto.Id,
            OrganizerType = dto.OrganizerType,
            OrganizerId = dto.OrganizerId,
            Title = dto.Title,
            Description = dto.Description,
            CoverImageUrl = dto.CoverImageUrl,
            Location = dto.Location,
            IsOnline = dto.IsOnline,
            ExternalLink = dto.ExternalLink,
            Timezone = dto.Timezone,
            Visibility = dto.Visibility,
            AllowComments = dto.AllowComments,
            StartAt = dto.StartAt,
            EndAt = dto.EndAt,
            CreatedAt = dto.CreatedAt,
            UpdatedAt = dto.UpdatedAt
        };

    private static EventAttendeeDto Map(EventsCoreAttendeeDto dto) =>
        new()
        {
            Id = dto.Id,
            EventId = dto.EventId,
            UserId = dto.UserId,
            Status = dto.Status,
            JoinedAt = dto.JoinedAt,
            UpdatedAt = dto.UpdatedAt
        };

    private static EventScheduleDto Map(EventsCoreScheduleDto dto) =>
        new()
        {
            Id = dto.Id,
            EventId = dto.EventId,
            TimeLabel = dto.TimeLabel,
            Title = dto.Title,
            SpeakerName = dto.SpeakerName,
            OrderIndex = dto.OrderIndex,
            CreatedAt = dto.CreatedAt
        };

    private static EventSpeakerDto Map(EventsCoreSpeakerDto dto) =>
        new()
        {
            Id = dto.Id,
            Name = dto.Name,
            Title = dto.Title,
            AvatarUrl = dto.AvatarUrl,
            CreatedAt = dto.CreatedAt
        };

    private static EventSpeakerMapDto Map(EventsCoreSpeakerMapDto dto) =>
        new()
        {
            Id = dto.Id,
            EventId = dto.EventId,
            SpeakerId = dto.SpeakerId,
            OrderIndex = dto.OrderIndex,
            Speaker = dto.Speaker is null ? null : Map(dto.Speaker)
        };
}
