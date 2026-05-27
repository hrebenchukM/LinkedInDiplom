using Events.Contracts.DTOs;
using Events.Contracts.Parameters.EventSpeakerMap;
using Events.Contracts.Results;

namespace Events.Contracts.Services;

public interface IEventSpeakerMapService
{
    Task<EventSpeakerMapResult> AttachAsync(AttachSpeakerToEventParameters parameters);
    Task<EventSpeakerMapResult> DetachAsync(DetachSpeakerFromEventParameters parameters);
    Task<IReadOnlyCollection<EventSpeakerMapDto>> GetByEventIdAsync(GetEventSpeakersParameters parameters);
}
