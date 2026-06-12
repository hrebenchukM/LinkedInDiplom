namespace Content.Contracts.Parameters.SavedPost;

// Параметры отмены сохранения поста (UserId из JWT)
public record UnsavePostParameters
{
    public string UserId { get; init; } = default!;

    public Guid PostId { get; init; }
}
