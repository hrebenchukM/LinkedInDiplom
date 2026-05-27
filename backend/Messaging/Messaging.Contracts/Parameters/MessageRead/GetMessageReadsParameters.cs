namespace Messaging.Contracts.Parameters.MessageRead;

public record GetMessageReadsParameters
{
    public string UserId { get; init; } = default!;
    public Guid MessageId { get; init; }
}
