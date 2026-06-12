namespace Content.Contracts.Parameters.PostMedia;

// Параметры списка медиа поста (ViewerUserId из JWT — проверка доступа к посту)
public record GetPostMediaParameters
{
    public string ViewerUserId { get; init; } = default!;

    public Guid PostId { get; init; }
}
