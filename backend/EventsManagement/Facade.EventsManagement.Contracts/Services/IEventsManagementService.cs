using Facade.EventsManagement.Contracts.DTOs;
using Facade.EventsManagement.Contracts.Requests.Event;
using Facade.EventsManagement.Contracts.Requests.EventSchedule;
using Facade.EventsManagement.Contracts.Requests.EventSpeaker;
using Facade.EventsManagement.Contracts.Requests.EventSpeakerMap;
using Facade.EventsManagement.Contracts.Responses;

namespace Facade.EventsManagement.Contracts.Services;

public interface IEventsManagementService
{
    Task<EventResponse> CreateEventAsync(string userId, CreateEventRequest request);
    Task<IReadOnlyCollection<EventDto>> GetMyEventsAsync(string userId, int? limit, DateTime? fromStartAt, DateTime? toStartAt);
    Task<EventDto?> GetEventByIdAsync(Guid eventId);
    Task<EventResponse> UpdateEventAsync(string userId, Guid eventId, UpdateEventRequest request);
    Task<EventResponse> DeleteEventAsync(string userId, Guid eventId);

    Task<EventAttendeeResponse> JoinEventAsync(string userId, Guid eventId);
    Task<EventAttendeeResponse> LeaveEventAsync(string userId, Guid eventId);
    Task<IReadOnlyCollection<EventAttendeeDto>> GetEventAttendeesAsync(Guid eventId, int? limit);

    Task<EventScheduleResponse> CreateScheduleItemAsync(string userId, Guid eventId, CreateEventScheduleRequest request);
    Task<IReadOnlyCollection<EventScheduleDto>> GetEventScheduleAsync(Guid eventId);
    Task<EventScheduleResponse> UpdateScheduleItemAsync(string userId, Guid eventId, Guid scheduleId, UpdateEventScheduleRequest request);
    Task<EventScheduleResponse> DeleteScheduleItemAsync(string userId, Guid eventId, Guid scheduleId);

    Task<EventSpeakerResponse> CreateSpeakerAsync(string userId, CreateEventSpeakerRequest request);
    Task<EventSpeakerDto?> GetSpeakerByIdAsync(string userId, Guid speakerId);
    Task<EventSpeakerResponse> UpdateSpeakerAsync(string userId, Guid speakerId, UpdateEventSpeakerRequest request);
    Task<EventSpeakerResponse> DeleteSpeakerAsync(string userId, Guid speakerId);

    Task<EventSpeakerMapResponse> AttachSpeakerToEventAsync(string userId, Guid eventId, AttachSpeakerToEventRequest request);
    Task<EventSpeakerMapResponse> DetachSpeakerFromEventAsync(string userId, Guid eventId, Guid speakerId);
    Task<IReadOnlyCollection<EventSpeakerMapDto>> GetEventSpeakersAsync(Guid eventId);
}
