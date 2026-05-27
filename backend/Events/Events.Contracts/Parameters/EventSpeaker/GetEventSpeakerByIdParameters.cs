namespace Events.Contracts.Parameters.EventSpeaker;

public record GetEventSpeakerByIdParameters
{
    public string CurrentUserId { get; init; } = default!;
    public Guid SpeakerId { get; init; }
}
