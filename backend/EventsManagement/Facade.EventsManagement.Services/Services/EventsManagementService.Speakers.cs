using Events.Contracts.Parameters.EventSpeaker;
using Facade.EventsManagement.Contracts.DTOs;
using Facade.EventsManagement.Contracts.Requests.EventSpeaker;
using Facade.EventsManagement.Contracts.Responses;
using Facade.FileStorage.Contracts;
using Facade.FileStorage.Contracts.Upload;
using Facade.Shared.Contracts.Pagination;

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

    public async Task<PagedResponse<EventSpeakerDto>> GetSpeakersAsync(
        GetEventSpeakersQueryRequest request,
        CancellationToken cancellationToken = default)
    {
        var (page, pageSize, skip) = Pagination.Normalize(request);

        var result = await _eventsClient.Speakers.GetSpeakersAsync(
            new GetEventSpeakersParameters
            {
                Skip = skip,
                Take = pageSize,
                Query = request.Query
            },
            cancellationToken);

        var items = result.Items
            .Select(MapEventSpeakerToFacadeDto)
            .ToList();

        return Pagination.Create(items, page, pageSize, result.TotalCount);
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
        var existingSpeaker = await GetSpeakerByIdAsync(userId, speakerId);

        if (existingSpeaker is null)
        {
            return new EventSpeakerResponse
            {
                Success = false,
                Errors = new[] { "Speaker not found." }
            };
        }

        var oldAvatarUrl = existingSpeaker.AvatarUrl;

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
                    AllowedExtensions = FileUploadConstants.GeneralImageExtensions,
                    AllowedContentTypes = FileUploadConstants.GeneralImageContentTypes
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

        var response = await UpdateSpeakerAsync(
            userId,
            speakerId,
            new UpdateEventSpeakerRequest
            {
                Name = existingSpeaker.Name,
                Title = existingSpeaker.Title,
                AvatarUrl = avatarUrl
            });

        if (response.Success)
            await _fileStorageService.DeleteAsync(oldAvatarUrl, cancellationToken);

        return response;
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
