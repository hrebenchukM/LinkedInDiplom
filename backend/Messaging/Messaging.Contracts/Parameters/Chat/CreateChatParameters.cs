namespace Messaging.Contracts.Parameters.Chat;

public record CreateChatParameters
{
    public string UserId { get; init; } = default!;
}
