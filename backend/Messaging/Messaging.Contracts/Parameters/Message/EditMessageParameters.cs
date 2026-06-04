namespace Messaging.Contracts.Parameters.Message;

public record EditMessageParameters
{
    public string UserId { get; init; } = default!;
    public Guid MessageId { get; init; }
    public string Content { get; init; } = default!;
}
