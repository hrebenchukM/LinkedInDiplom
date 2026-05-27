namespace Messaging.Contracts.Parameters.MessageRead;

public record MarkMessageReadParameters
{
    public string UserId { get; init; } = default!;
    public Guid MessageId { get; init; }
}
