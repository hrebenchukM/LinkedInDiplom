using Events.Contracts.DTOs;

namespace Events.Contracts.Results;

public record EventSpeakerMapResult
{
    public bool Succeeded { get; init; }
    public EventSpeakerMapDto? EventSpeakerMap { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
