namespace Events.Contracts.Parameters.EventAttendee;

public record JoinEventParameters
{
    public string CurrentUserId { get; init; } = default!;
    public Guid EventId { get; init; }
    public string Status { get; init; } = default!;
}
