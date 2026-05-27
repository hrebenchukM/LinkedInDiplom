namespace Events.Contracts.Parameters.EventSpeakerMap;

public record DetachSpeakerFromEventParameters
{
    public string CurrentUserId { get; init; } = default!;
    public Guid EventId { get; init; }
    public Guid SpeakerId { get; init; }
}
