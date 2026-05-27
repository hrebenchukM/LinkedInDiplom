namespace Content.Contracts.Parameters.PostView;

// Параметры получения просмотров поста (AuthorId из JWT — только автор поста)
public record GetPostViewsParameters
{
    public string AuthorId { get; init; } = default!;

    public Guid PostId { get; init; }
}
