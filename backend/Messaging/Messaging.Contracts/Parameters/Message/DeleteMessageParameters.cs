namespace Messaging.Contracts.Parameters.Message;

public record DeleteMessageParameters
{
    public string UserId { get; init; } = default!;
    public Guid MessageId { get; init; }
}
