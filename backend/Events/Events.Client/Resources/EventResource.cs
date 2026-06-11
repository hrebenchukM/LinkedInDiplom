using Events.Client.Contracts.Resources;
using Events.Contracts.DTOs;
using Events.Contracts.Parameters.Event;
using Events.Contracts.Results;
using Events.Contracts.Services;

namespace Events.Client.Resources;

/// <summary>
/// Resource-адаптер для событий EventsClient.
/// Сейчас это in-process вызов, но контур уже готов к вынесению в отдельный сервис.
/// </summary>
public class EventResource(IEventService eventService) : IEventResource
{
    public Task<EventResult> CreateAsync(CreateEventParameters parameters)
    {
        return eventService.CreateAsync(parameters);
    }

    public Task<IReadOnlyCollection<EventDto>> GetMyEventsAsync(GetMyEventsParameters parameters)
    {
        return eventService.GetMyEventsAsync(parameters);
    }

    public Task<EventsPageResult> DiscoverEventsAsync(
        DiscoverEventsParameters parameters,
        CancellationToken cancellationToken = default)
    {
        return eventService.DiscoverEventsAsync(parameters, cancellationToken);
    }

    public Task<EventsPageResult> GetAttendingEventsAsync(
        GetAttendingEventsParameters parameters,
        CancellationToken cancellationToken = default)
    {
        return eventService.GetAttendingEventsAsync(parameters, cancellationToken);
    }

    public Task<EventDto?> GetByIdAsync(GetEventByIdParameters parameters)
    {
        return eventService.GetByIdAsync(parameters);
    }

    public Task<EventResult> UpdateAsync(UpdateEventParameters parameters)
    {
        return eventService.UpdateAsync(parameters);
    }

    public Task<EventResult> DeleteAsync(DeleteEventParameters parameters)
    {
        return eventService.DeleteAsync(parameters);
    }

    public Task<AdminEventsResult> GetAdminEventsAsync(
        GetAdminEventsParameters parameters,
        CancellationToken cancellationToken = default)
    {
        return eventService.GetAdminEventsAsync(parameters, cancellationToken);
    }

    public Task AdminSoftDeleteEventAsync(
        Guid eventId,
        CancellationToken cancellationToken = default)
    {
        return eventService.AdminSoftDeleteEventAsync(eventId, cancellationToken);
    }

    public Task AdminRestoreEventAsync(
        Guid eventId,
        CancellationToken cancellationToken = default)
    {
        return eventService.AdminRestoreEventAsync(eventId, cancellationToken);
    }

    public Task<EventsStatsDto> GetEventsStatsAsync(
        CancellationToken cancellationToken = default)
    {
        return eventService.GetEventsStatsAsync(cancellationToken);
    }
}
