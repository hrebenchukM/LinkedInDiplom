using Events.Contracts.Parameters.EventSpeakerMap;
using Facade.EventsManagement.Contracts.DTOs;
using Facade.EventsManagement.Contracts.Requests.EventSpeakerMap;
using Facade.EventsManagement.Contracts.Responses;

namespace Facade.EventsManagement.Services.Services;

public partial class EventsManagementService
{
    public async Task<EventSpeakerMapResponse> AttachSpeakerToEventAsync(string userId, Guid eventId, AttachSpeakerToEventRequest request)
    {
        var result = await _eventsClient.SpeakerMap.AttachAsync(new AttachSpeakerToEventParameters
        {
            CurrentUserId = userId,
            EventId = eventId,
            SpeakerId = request.SpeakerId,
            OrderIndex = request.OrderIndex
        });

        return Map(result);
    }

    public async Task<EventSpeakerMapResponse> DetachSpeakerFromEventAsync(string userId, Guid eventId, Guid speakerId)
    {
        var result = await _eventsClient.SpeakerMap.DetachAsync(new DetachSpeakerFromEventParameters
        {
            CurrentUserId = userId,
            EventId = eventId,
            SpeakerId = speakerId
        });

        return Map(result);
    }

    public async Task<IReadOnlyCollection<EventSpeakerMapDto>> GetEventSpeakersAsync(Guid eventId)
    {
        var maps = await _eventsClient.SpeakerMap.GetByEventIdAsync(new GetEventSpeakersParameters
        {
            CurrentUserId = string.Empty,
            EventId = eventId
        });

        return maps.Select(Map).ToList();
    }
}
