using Events.Contracts.DTOs;

namespace Events.Contracts.Results;

public record EventSpeakerResult
{
    public bool Succeeded { get; init; }
    public EventSpeakerDto? EventSpeaker { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
