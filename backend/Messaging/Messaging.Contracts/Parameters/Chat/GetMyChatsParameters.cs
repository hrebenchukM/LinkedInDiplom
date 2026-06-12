namespace Messaging.Contracts.Parameters.Chat;

public record GetMyChatsParameters
{
    public string UserId { get; init; } = default!;

    public int Skip { get; init; }

    public int Take { get; init; }
}
