namespace Content.Events.Contracts.Events;

public record ReactionUpsertedEvent
{
    public Guid ReactionId { get; init; }

    public Guid PostId { get; init; }

    public string PostAuthorUserId { get; init; } = default!;

    public string ActorUserId { get; init; } = default!;

    public string ReactionType { get; init; } = default!;

    public bool IsNewReaction { get; init; }

    public DateTime CreatedAt { get; init; }
}
