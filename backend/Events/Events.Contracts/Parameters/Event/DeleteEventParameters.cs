namespace Events.Contracts.Parameters.Event;

public record DeleteEventParameters
{
    public string CurrentUserId { get; init; } = default!;
    public Guid EventId { get; init; }
}
