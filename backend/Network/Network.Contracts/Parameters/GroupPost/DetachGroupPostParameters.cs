namespace Network.Contracts.Parameters.GroupPost;

// Параметры отвязки поста от группы (UserId из JWT)
public record DetachGroupPostParameters
{
    public string UserId { get; init; } = default!;

    public Guid GroupId { get; init; }

    public Guid PostId { get; init; }
}
