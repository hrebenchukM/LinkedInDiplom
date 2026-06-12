namespace Events.Contracts.Parameters.Event;

public record GetAttendingEventsParameters
{
    public string CurrentUserId { get; init; } = default!;

    public int Skip { get; init; }

    public int Take { get; init; }

    public DateTime? FromStartAt { get; init; }

    public DateTime? ToStartAt { get; init; }
}
