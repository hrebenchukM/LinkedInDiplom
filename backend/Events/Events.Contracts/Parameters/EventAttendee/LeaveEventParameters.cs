namespace Events.Contracts.Parameters.EventAttendee;

public record LeaveEventParameters
{
    public string CurrentUserId { get; init; } = default!;
    public Guid EventId { get; init; }
}
