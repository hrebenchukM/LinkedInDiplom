namespace Content.Contracts.Parameters.SavedPost;

// Параметры сохранения поста (UserId из JWT)
public record SavePostParameters
{
    public string UserId { get; init; } = default!;

    public Guid PostId { get; init; }
}
