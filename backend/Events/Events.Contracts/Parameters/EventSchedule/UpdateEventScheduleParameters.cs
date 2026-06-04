namespace Events.Contracts.Parameters.EventSchedule;

public record UpdateEventScheduleParameters
{
    public string CurrentUserId { get; init; } = default!;
    public Guid ScheduleId { get; init; }
    public Guid EventId { get; init; }
    public string? TimeLabel { get; init; }
    public string Title { get; init; } = default!;
    public string? SpeakerName { get; init; }
    public int OrderIndex { get; init; }
}
