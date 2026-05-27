using Events.Contracts.DTOs;

namespace Events.Contracts.Results;

public record EventAttendeeResult
{
    public bool Succeeded { get; init; }
    public EventAttendeeDto? EventAttendee { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
