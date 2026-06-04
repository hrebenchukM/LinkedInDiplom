using Facade.EventsManagement.Contracts.DTOs;

namespace Facade.EventsManagement.Contracts.Responses;

public record EventSpeakerMapResponse
{
    public bool Success { get; init; }
    public EventSpeakerMapDto? EventSpeakerMap { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
