using Events.Contracts.DTOs;
using Events.Contracts.Parameters.EventAttendee;
using Events.Contracts.Results;

namespace Events.Client.Contracts.Resources;

public interface IEventAttendeeResource
{
    Task<EventAttendeeResult> JoinAsync(JoinEventParameters parameters);
    Task<EventAttendeeResult> LeaveAsync(LeaveEventParameters parameters);
    Task<IReadOnlyCollection<EventAttendeeDto>> GetEventAttendeesAsync(GetEventAttendeesParameters parameters);
}
