namespace Events.Contracts.Parameters.EventSpeaker;

public record CreateEventSpeakerParameters
{
    public string CurrentUserId { get; init; } = default!;
    public string Name { get; init; } = default!;
    public string? Title { get; init; }
    public string? AvatarUrl { get; init; }
}
