using Events.Contracts.DTOs;

namespace Events.Contracts.Results;

public record EventScheduleResult
{
    public bool Succeeded { get; init; }
    public EventScheduleDto? EventSchedule { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}
