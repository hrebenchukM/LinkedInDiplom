namespace Messaging.Contracts.Parameters.MessageMedia;

public record GetMessageMediaParameters
{
    public string UserId { get; init; } = default!;
    public Guid MessageId { get; init; }
}
