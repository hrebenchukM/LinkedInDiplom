using Events.Contracts.Parameters.Event;
using Facade.EventsManagement.Contracts.DTOs;
using Facade.EventsManagement.Contracts.Requests.Event;
using Facade.EventsManagement.Contracts.Responses;
using Facade.FileStorage.Contracts;
using Facade.FileStorage.Contracts.Upload;

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

        return MapEventResultToFacadeResponse(result);
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

        return events.Select(MapEventToFacadeDto).ToList();
    }

    public async Task<EventDto?> GetEventByIdAsync(Guid eventId)
    {
        var entity = await _eventsClient.Events.GetByIdAsync(new GetEventByIdParameters
        {
            CurrentUserId = string.Empty,
            EventId = eventId
        });

        return entity is null ? null : MapEventToFacadeDto(entity);
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

        return MapEventResultToFacadeResponse(result);
    }

    public async Task<EventResponse> UploadEventCoverAsync(
        string userId,
        Guid eventId,
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        var existingEvent = await GetEventByIdAsync(eventId);

        if (existingEvent is null || !string.Equals(existingEvent.OrganizerId, userId, StringComparison.Ordinal))
        {
            return new EventResponse
            {
                Success = false,
                Errors = new[] { "Event not found." }
            };
        }

        var oldCoverImageUrl = existingEvent.CoverImageUrl;

        string coverImageUrl;

        try
        {
            coverImageUrl = await _fileStorageService.SaveAsync(
                fileStream,
                fileName,
                contentType,
                new FileStoragePathOptions
                {
                    ModuleName = "events",
                    EntityName = "event-cover",
                    OwnerId = userId,
                    EntityId = eventId.ToString(),
                    AllowedExtensions = FileUploadConstants.GeneralImageExtensions,
                    AllowedContentTypes = FileUploadConstants.GeneralImageContentTypes
                },
                cancellationToken);
        }
        catch (InvalidOperationException ex)
        {
            return new EventResponse
            {
                Success = false,
                Errors = new[] { ex.Message }
            };
        }

        var response = await UpdateEventAsync(
            userId,
            eventId,
            new UpdateEventRequest
            {
                OrganizerType = existingEvent.OrganizerType,
                Title = existingEvent.Title,
                Description = existingEvent.Description,
                CoverImageUrl = coverImageUrl,
                Location = existingEvent.Location,
                IsOnline = existingEvent.IsOnline,
                ExternalLink = existingEvent.ExternalLink,
                Timezone = existingEvent.Timezone,
                Visibility = existingEvent.Visibility,
                AllowComments = existingEvent.AllowComments,
                StartAt = existingEvent.StartAt,
                EndAt = existingEvent.EndAt
            });

        if (response.Success)
            await _fileStorageService.DeleteAsync(oldCoverImageUrl, cancellationToken);

        return response;
    }

    public async Task<EventResponse> DeleteEventAsync(string userId, Guid eventId)
    {
        var result = await _eventsClient.Events.DeleteAsync(new DeleteEventParameters
        {
            CurrentUserId = userId,
            EventId = eventId
        });

        return MapEventResultToFacadeResponse(result);
    }
}
