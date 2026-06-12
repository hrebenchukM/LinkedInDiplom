namespace Events.Contracts.Parameters.Event;

public record GetMyEventsParameters
{
    public string CurrentUserId { get; init; } = default!;
    public int? Limit { get; init; }
    public DateTime? FromStartAt { get; init; }
    public DateTime? ToStartAt { get; init; }
}
