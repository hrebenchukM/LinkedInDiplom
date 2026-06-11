using Events.Client.Contracts.Resources;
using Events.Contracts.DTOs;
using Events.Contracts.Parameters.EventAttendee;
using Events.Contracts.Results;
using Events.Contracts.Services;

namespace Events.Client.Resources;

public class EventAttendeeResource(IEventAttendeeService attendeeService) : IEventAttendeeResource
{
    public Task<EventAttendeeResult> JoinAsync(JoinEventParameters parameters)
    {
        return attendeeService.JoinAsync(parameters);
    }

    public Task<EventAttendeeResult> LeaveAsync(LeaveEventParameters parameters)
    {
        return attendeeService.LeaveAsync(parameters);
    }

    public Task<IReadOnlyCollection<EventAttendeeDto>> GetEventAttendeesAsync(GetEventAttendeesParameters parameters)
    {
        return attendeeService.GetEventAttendeesAsync(parameters);
    }

    public Task<IReadOnlyCollection<Guid>> GetUserAttendingEventIdsAsync(
        GetUserAttendingEventIdsParameters parameters,
        CancellationToken cancellationToken = default)
    {
        return attendeeService.GetUserAttendingEventIdsAsync(parameters, cancellationToken);
    }
}
