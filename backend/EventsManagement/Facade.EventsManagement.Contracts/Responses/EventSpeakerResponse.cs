using Facade.EventsManagement.Contracts.DTOs;

namespace Facade.EventsManagement.Contracts.Responses;

public record EventSpeakerResponse
{
    public bool Success { get; init; }
    public EventSpeakerDto? EventSpeaker { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
