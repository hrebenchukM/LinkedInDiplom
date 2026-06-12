namespace Events.Contracts.Parameters.EventSchedule;

public record DeleteEventScheduleParameters
{
    public string CurrentUserId { get; init; } = default!;
    public Guid ScheduleId { get; init; }
    public Guid EventId { get; init; }
}
