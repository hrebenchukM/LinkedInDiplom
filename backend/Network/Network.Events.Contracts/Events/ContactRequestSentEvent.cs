namespace Network.Events.Contracts.Events;

public record ContactRequestSentEvent
{
    public Guid ContactRequestId { get; init; }

    public string SenderUserId { get; init; } = default!;

    public string ReceiverUserId { get; init; } = default!;

    public DateTime CreatedAt { get; init; }
}
