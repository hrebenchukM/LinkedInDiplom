using Events.Contracts.Parameters.EventSpeaker;
using Facade.EventsManagement.Contracts.DTOs;
using Facade.EventsManagement.Contracts.Requests.EventSpeaker;
using Facade.EventsManagement.Contracts.Responses;

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
