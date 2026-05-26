namespace Content.Contracts.Parameters.Post;

// Параметры получения поста по Id (ViewerUserId из JWT — проверка доступа)
public record GetPostByIdParameters
{
    public string ViewerUserId { get; init; } = default!;

    public Guid PostId { get; init; }
}
