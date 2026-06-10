namespace Network.Events.Contracts.Events;

public record ContactRequestAcceptedEvent
{
    public Guid ContactRequestId { get; init; }

    public string RequesterUserId { get; init; } = default!;

    public string AccepterUserId { get; init; } = default!;

    public DateTime AcceptedAt { get; init; }
}
