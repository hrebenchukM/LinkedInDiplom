namespace Messaging.Contracts.Parameters.Chat;

public record DeleteChatParameters
{
    public string UserId { get; init; } = default!;
    public Guid ChatId { get; init; }
}
