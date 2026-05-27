namespace Events.Contracts.Parameters.EventSpeakerMap;

public record GetEventSpeakersParameters
{
    public string CurrentUserId { get; init; } = default!;
    public Guid EventId { get; init; }
}
