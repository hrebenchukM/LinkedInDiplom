namespace Facade.EventsManagement.Contracts.Requests.EventSpeakerMap;

public record AttachSpeakerToEventRequest
{
    public Guid SpeakerId { get; init; }
    public int OrderIndex { get; init; }
}
