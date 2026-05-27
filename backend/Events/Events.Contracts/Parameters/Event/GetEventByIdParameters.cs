namespace Events.Contracts.Parameters.Event;

public record GetEventByIdParameters
{
    public string CurrentUserId { get; init; } = default!;
    public Guid EventId { get; init; }
}
