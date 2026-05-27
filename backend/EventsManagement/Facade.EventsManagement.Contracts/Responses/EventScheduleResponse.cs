using Facade.EventsManagement.Contracts.DTOs;

namespace Facade.EventsManagement.Contracts.Responses;

public record EventScheduleResponse
{
    public bool Success { get; init; }
    public EventScheduleDto? EventSchedule { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
