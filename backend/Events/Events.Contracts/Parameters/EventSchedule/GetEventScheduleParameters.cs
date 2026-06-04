namespace Events.Contracts.Parameters.EventSchedule;

public record GetEventScheduleParameters
{
    public string CurrentUserId { get; init; } = default!;
    public Guid EventId { get; init; }
}
