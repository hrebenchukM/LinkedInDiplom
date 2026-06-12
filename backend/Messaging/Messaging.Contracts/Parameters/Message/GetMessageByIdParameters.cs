namespace Messaging.Contracts.Parameters.Message;

public record GetMessageByIdParameters
{
    public string UserId { get; init; } = default!;
    public Guid MessageId { get; init; }
}
