using Facade.EventsManagement.Contracts.DTOs;

namespace Facade.EventsManagement.Contracts.Responses;

public record EventAttendeeResponse
{
    public bool Success { get; init; }
    public EventAttendeeDto? EventAttendee { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
