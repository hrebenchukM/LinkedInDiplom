namespace Messaging.Contracts.Parameters.ChatMember;

public record LeaveChatParameters
{
    public string UserId { get; init; } = default!;
    public Guid ChatId { get; init; }
}
