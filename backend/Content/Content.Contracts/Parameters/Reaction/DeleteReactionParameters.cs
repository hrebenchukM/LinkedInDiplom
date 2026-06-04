namespace Content.Contracts.Parameters.Reaction;

// Параметры удаления реакции (UserId из JWT; hard delete строки)
public record DeleteReactionParameters
{
    public string UserId { get; init; } = default!;

    public Guid PostId { get; init; }
}
