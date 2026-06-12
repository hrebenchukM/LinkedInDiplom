using Facade.EventsManagement.Contracts.DTOs;

namespace Facade.EventsManagement.Contracts.Responses;

public record EventResponse
{
    public bool Success { get; init; }
    public EventDto? Event { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
