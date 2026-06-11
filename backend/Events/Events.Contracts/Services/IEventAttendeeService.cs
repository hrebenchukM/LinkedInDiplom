using Events.Contracts.DTOs;
using Events.Contracts.Parameters.EventAttendee;
using Events.Contracts.Results;

namespace Events.Contracts.Services;

public interface IEventAttendeeService
{
    Task<EventAttendeeResult> JoinAsync(JoinEventParameters parameters);
    Task<EventAttendeeResult> LeaveAsync(LeaveEventParameters parameters);
    Task<IReadOnlyCollection<EventAttendeeDto>> GetEventAttendeesAsync(GetEventAttendeesParameters parameters);

    Task<IReadOnlyCollection<Guid>> GetUserAttendingEventIdsAsync(
        GetUserAttendingEventIdsParameters parameters,
        CancellationToken cancellationToken = default);
}
