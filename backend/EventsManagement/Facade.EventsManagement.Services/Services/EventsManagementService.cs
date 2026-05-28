using Events.Client.Contracts;
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
using Facade.EventsManagement.Contracts.Responses;
using Facade.EventsManagement.Contracts.Services;

namespace Facade.EventsManagement.Services.Services;

public partial class EventsManagementService : IEventsManagementService
{
    private readonly IEventsClient _eventsClient;

    public EventsManagementService(IEventsClient eventsClient)
    {
        _eventsClient = eventsClient;
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
