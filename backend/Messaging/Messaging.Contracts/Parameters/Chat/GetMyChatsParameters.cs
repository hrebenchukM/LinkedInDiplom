namespace Messaging.Contracts.Parameters.Chat;

public record GetMyChatsParameters
{
    public string UserId { get; init; } = default!;
}
