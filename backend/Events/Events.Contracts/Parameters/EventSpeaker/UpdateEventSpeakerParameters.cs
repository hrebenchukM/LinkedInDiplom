namespace Events.Contracts.Parameters.EventSpeaker;

public record UpdateEventSpeakerParameters
{
    public string CurrentUserId { get; init; } = default!;
    public Guid SpeakerId { get; init; }
    public string Name { get; init; } = default!;
    public string? Title { get; init; }
    public string? AvatarUrl { get; init; }
}
