namespace Content.Contracts.Parameters.Reaction;

// Параметры списка реакций поста (ViewerUserId из JWT — проверка доступа к посту)
public record GetReactionsByPostParameters
{
    public string ViewerUserId { get; init; } = default!;

    public Guid PostId { get; init; }
}
