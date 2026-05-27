namespace Facade.EventsManagement.Contracts.Requests.EventSpeaker;

public record UpdateEventSpeakerRequest
{
    public string Name { get; init; } = default!;
    public string? Title { get; init; }
    public string? AvatarUrl { get; init; }
}
