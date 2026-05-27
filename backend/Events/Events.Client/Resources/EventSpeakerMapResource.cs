using Events.Client.Contracts.Resources;
using Events.Contracts.DTOs;
using Events.Contracts.Parameters.EventSpeakerMap;
using Events.Contracts.Results;
using Events.Contracts.Services;

namespace Events.Client.Resources;

public class EventSpeakerMapResource(IEventSpeakerMapService speakerMapService) : IEventSpeakerMapResource
{
    public Task<EventSpeakerMapResult> AttachAsync(AttachSpeakerToEventParameters parameters)
    {
        return speakerMapService.AttachAsync(parameters);
    }

    public Task<EventSpeakerMapResult> DetachAsync(DetachSpeakerFromEventParameters parameters)
    {
        return speakerMapService.DetachAsync(parameters);
    }

    public Task<IReadOnlyCollection<EventSpeakerMapDto>> GetByEventIdAsync(GetEventSpeakersParameters parameters)
    {
        return speakerMapService.GetByEventIdAsync(parameters);
    }
}
