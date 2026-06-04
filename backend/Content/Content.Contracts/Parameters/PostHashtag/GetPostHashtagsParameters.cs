namespace Content.Contracts.Parameters.PostHashtag;

// Параметры получения хэштегов поста (ViewerUserId из JWT — проверка доступа)
public record GetPostHashtagsParameters
{
    public string ViewerUserId { get; init; } = default!;

    public Guid PostId { get; init; }
}
