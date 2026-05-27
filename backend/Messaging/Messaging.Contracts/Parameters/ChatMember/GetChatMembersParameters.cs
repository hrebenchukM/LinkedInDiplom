namespace Messaging.Contracts.Parameters.ChatMember;

public record GetChatMembersParameters
{
    public string UserId { get; init; } = default!;
    public Guid ChatId { get; init; }
}
