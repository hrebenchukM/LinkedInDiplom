namespace Events.Contracts.Parameters.EventSpeaker;

public record DeleteEventSpeakerParameters
{
    public string CurrentUserId { get; init; } = default!;
    public Guid SpeakerId { get; init; }
}
