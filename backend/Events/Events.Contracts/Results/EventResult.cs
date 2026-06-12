using Events.Contracts.DTOs;

namespace Events.Contracts.Results;

public record EventResult
{
    public bool Succeeded { get; init; }
    public EventDto? Event { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
