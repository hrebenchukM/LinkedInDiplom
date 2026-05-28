using Events.Contracts.Parameters.EventAttendee;
using Facade.EventsManagement.Contracts.DTOs;
using Facade.EventsManagement.Contracts.Responses;

namespace Facade.EventsManagement.Services.Services;

public partial class EventsManagementService
{
    public async Task<EventAttendeeResponse> JoinEventAsync(string userId, Guid eventId)
    {
        var result = await _eventsClient.Attendees.JoinAsync(new JoinEventParameters
        {
            CurrentUserId = userId,
            EventId = eventId,
            Status = "joined"
        });

        return Map(result);
    }

    public async Task<EventAttendeeResponse> LeaveEventAsync(string userId, Guid eventId)
    {
        var result = await _eventsClient.Attendees.LeaveAsync(new LeaveEventParameters
        {
            CurrentUserId = userId,
            EventId = eventId
        });

        return Map(result);
    }

    public async Task<IReadOnlyCollection<EventAttendeeDto>> GetEventAttendeesAsync(Guid eventId, int? limit)
    {
        var attendees = await _eventsClient.Attendees.GetEventAttendeesAsync(new GetEventAttendeesParameters
        {
            CurrentUserId = string.Empty,
            EventId = eventId,
            Limit = limit
        });

        return attendees.Select(Map).ToList();
    }
}
