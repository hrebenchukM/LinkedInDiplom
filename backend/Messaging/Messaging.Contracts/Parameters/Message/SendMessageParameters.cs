namespace Messaging.Contracts.Parameters.Message;

public record SendMessageParameters
{
    public string UserId { get; init; } = default!;
    public Guid ChatId { get; init; }
    public string Content { get; init; } = default!;
}
