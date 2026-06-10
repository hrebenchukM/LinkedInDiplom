using Events.Contracts.Parameters.EventSpeaker;
using Facade.EventsManagement.Contracts.DTOs;
using Facade.EventsManagement.Contracts.Requests.EventSpeaker;
using Facade.EventsManagement.Contracts.Responses;
using Facade.FileStorage.Contracts;

namespace Facade.EventsManagement.Services.Services;

public partial class EventsManagementService
{
    public async Task<EventSpeakerResponse> CreateSpeakerAsync(string userId, CreateEventSpeakerRequest request)
    {
        var result = await _eventsClient.Speakers.CreateAsync(new CreateEventSpeakerParameters
        {
            CurrentUserId = userId,
            Name = request.Name,
            Title = request.Title,
            AvatarUrl = request.AvatarUrl
        });

        return MapEventSpeakerResultToFacadeResponse(result);
    }

    public async Task<EventSpeakerDto?> GetSpeakerByIdAsync(string userId, Guid speakerId)
    {
        var speaker = await _eventsClient.Speakers.GetByIdAsync(new GetEventSpeakerByIdParameters
        {
            CurrentUserId = userId,
            SpeakerId = speakerId
        });

        return speaker is null ? null : MapEventSpeakerToFacadeDto(speaker);
    }

    public async Task<EventSpeakerResponse> UpdateSpeakerAsync(string userId, Guid speakerId, UpdateEventSpeakerRequest request)
    {
        var result = await _eventsClient.Speakers.UpdateAsync(new UpdateEventSpeakerParameters
        {
            CurrentUserId = userId,
            SpeakerId = speakerId,
            Name = request.Name,
            Title = request.Title,
            AvatarUrl = request.AvatarUrl
        });

        return MapEventSpeakerResultToFacadeResponse(result);
    }

    public async Task<EventSpeakerResponse> UploadSpeakerAvatarAsync(
        string userId,
        Guid speakerId,
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        string avatarUrl;

        try
        {
            avatarUrl = await _fileStorageService.SaveAsync(
                fileStream,
                fileName,
                contentType,
                new FileStoragePathOptions
                {
                    ModuleName = "events",
                    EntityName = "speaker-avatar",
                    OwnerId = userId,
                    EntityId = speakerId.ToString(),
                    AllowedExtensions = EventsImageExtensions,
                    AllowedContentTypes = EventsImageContentTypes
                },
                cancellationToken);
        }
        catch (InvalidOperationException ex)
        {
            return new EventSpeakerResponse
            {
                Success = false,
                Errors = new[] { ex.Message }
            };
        }

        var existingSpeaker = await GetSpeakerByIdAsync(userId, speakerId);

        if (existingSpeaker is null)
        {
            return new EventSpeakerResponse
            {
                Success = false,
                Errors = new[] { "Speaker not found." }
            };
        }

        return await UpdateSpeakerAsync(
            userId,
            speakerId,
            new UpdateEventSpeakerRequest
            {
                Name = existingSpeaker.Name,
                Title = existingSpeaker.Title,
                AvatarUrl = avatarUrl
            });
    }

    public async Task<EventSpeakerResponse> DeleteSpeakerAsync(string userId, Guid speakerId)
    {
        var result = await _eventsClient.Speakers.DeleteAsync(new DeleteEventSpeakerParameters
        {
            CurrentUserId = userId,
            SpeakerId = speakerId
        });

        return MapEventSpeakerResultToFacadeResponse(result);
    }
}
