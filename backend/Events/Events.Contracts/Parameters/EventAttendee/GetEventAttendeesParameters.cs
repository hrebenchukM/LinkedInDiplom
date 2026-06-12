namespace Events.Contracts.Parameters.EventAttendee;

public record GetEventAttendeesParameters
{
    public string CurrentUserId { get; init; } = default!;
    public Guid EventId { get; init; }
    public int? Limit { get; init; }
}
