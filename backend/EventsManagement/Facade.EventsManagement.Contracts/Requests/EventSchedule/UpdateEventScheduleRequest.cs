namespace Facade.EventsManagement.Contracts.Requests.EventSchedule;

public record UpdateEventScheduleRequest
{
    public string? TimeLabel { get; init; }
    public string Title { get; init; } = default!;
    public string? SpeakerName { get; init; }
    public int OrderIndex { get; init; }
}
