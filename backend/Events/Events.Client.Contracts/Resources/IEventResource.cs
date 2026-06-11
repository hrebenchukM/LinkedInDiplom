using Events.Contracts.DTOs;
using Events.Contracts.Parameters.Event;
using Events.Contracts.Results;

namespace Events.Client.Contracts.Resources;

public interface IEventResource
{
    Task<EventResult> CreateAsync(CreateEventParameters parameters);
    Task<IReadOnlyCollection<EventDto>> GetMyEventsAsync(GetMyEventsParameters parameters);
    Task<EventsPageResult> DiscoverEventsAsync(
        DiscoverEventsParameters parameters,
        CancellationToken cancellationToken = default);
    Task<EventsPageResult> GetAttendingEventsAsync(
        GetAttendingEventsParameters parameters,
        CancellationToken cancellationToken = default);
    Task<EventDto?> GetByIdAsync(GetEventByIdParameters parameters);
    Task<EventResult> UpdateAsync(UpdateEventParameters parameters);
    Task<EventResult> DeleteAsync(DeleteEventParameters parameters);
    Task<AdminEventsResult> GetAdminEventsAsync(
        GetAdminEventsParameters parameters,
        CancellationToken cancellationToken = default);
    Task AdminSoftDeleteEventAsync(
        Guid eventId,
        CancellationToken cancellationToken = default);
    Task AdminRestoreEventAsync(
        Guid eventId,
        CancellationToken cancellationToken = default);
    Task<EventsStatsDto> GetEventsStatsAsync(
        CancellationToken cancellationToken = default);
}
