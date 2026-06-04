namespace Events.Contracts.Parameters.EventSpeakerMap;

public record AttachSpeakerToEventParameters
{
    public string CurrentUserId { get; init; } = default!;
    public Guid EventId { get; init; }
    public Guid SpeakerId { get; init; }
    public int OrderIndex { get; init; }
}
