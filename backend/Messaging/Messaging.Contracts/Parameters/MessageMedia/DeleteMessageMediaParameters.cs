namespace Messaging.Contracts.Parameters.MessageMedia;

public record DeleteMessageMediaParameters
{
    public string UserId { get; init; } = default!;
    public Guid MessageId { get; init; }
    public Guid MessageMediaId { get; init; }
}
