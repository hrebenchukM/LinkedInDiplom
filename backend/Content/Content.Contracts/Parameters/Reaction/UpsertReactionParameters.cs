namespace Content.Contracts.Parameters.Reaction;

// Параметры upsert реакции (UserId из JWT; reactionType: like | celebrate | support | love | insightful | funny)
public record UpsertReactionParameters
{
    public string UserId { get; init; } = default!;

    public Guid PostId { get; init; }

    public string ReactionType { get; init; } = default!;
}
