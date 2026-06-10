namespace Messaging.Contracts.Parameters.Message;

public record GetChatMessagesParameters
{
    public string UserId { get; init; } = default!;

    public Guid ChatId { get; init; }

    public int Skip { get; init; }

    public int Take { get; init; }
}
