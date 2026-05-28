using Events.Contracts.Parameters.Event;
using Facade.EventsManagement.Contracts.DTOs;
using Facade.EventsManagement.Contracts.Requests.Event;
using Facade.EventsManagement.Contracts.Responses;

namespace Facade.EventsManagement.Services.Services;

public partial class EventsManagementService
{
    public async Task<EventResponse> CreateEventAsync(string userId, CreateEventRequest request)
    {
        var result = await _eventsClient.Events.CreateAsync(new CreateEventParameters
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
        var events = await _eventsClient.Events.GetMyEventsAsync(new GetMyEventsParameters
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
        var entity = await _eventsClient.Events.GetByIdAsync(new GetEventByIdParameters
        {
            CurrentUserId = string.Empty,
            EventId = eventId
        });

        return entity is null ? null : Map(entity);
    }

    public async Task<EventResponse> UpdateEventAsync(string userId, Guid eventId, UpdateEventRequest request)
    {
        var result = await _eventsClient.Events.UpdateAsync(new UpdateEventParameters
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
        var result = await _eventsClient.Events.DeleteAsync(new DeleteEventParameters
        {
            CurrentUserId = userId,
            EventId = eventId
        });

        return Map(result);
    }
}
