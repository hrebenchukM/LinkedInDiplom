namespace Messaging.Contracts.Parameters.Chat;

public record GetChatByIdParameters
{
    public string UserId { get; init; } = default!;
    public Guid ChatId { get; init; }
}
