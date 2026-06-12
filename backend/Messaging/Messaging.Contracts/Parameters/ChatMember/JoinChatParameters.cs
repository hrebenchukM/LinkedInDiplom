namespace Messaging.Contracts.Parameters.ChatMember;

public record JoinChatParameters
{
    public string UserId { get; init; } = default!;
    public Guid ChatId { get; init; }
    public string? Folder { get; init; }
}
