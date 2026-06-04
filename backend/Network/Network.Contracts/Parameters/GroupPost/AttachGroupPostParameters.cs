namespace Network.Contracts.Parameters.GroupPost;

// Параметры привязки поста к группе (UserId из JWT)
public record AttachGroupPostParameters
{
    public string UserId { get; init; } = default!;

    public Guid GroupId { get; init; }

    public Guid PostId { get; init; }
}
