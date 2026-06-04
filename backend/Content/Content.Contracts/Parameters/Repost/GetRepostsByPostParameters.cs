namespace Content.Contracts.Parameters.Repost;

// Параметры получения репостов поста (ViewerUserId из JWT — проверка доступа)
public record GetRepostsByPostParameters
{
    public string ViewerUserId { get; init; } = default!;

    public Guid PostId { get; init; }
}
