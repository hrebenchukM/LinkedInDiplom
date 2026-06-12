namespace Content.Contracts.Parameters.Reaction;

// Параметры получения своей реакции на пост (UserId из JWT)
public record GetMyReactionParameters
{
    public string UserId { get; init; } = default!;

    public Guid PostId { get; init; }
}
