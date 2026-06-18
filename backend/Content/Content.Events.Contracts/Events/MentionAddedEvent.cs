namespace Content.Events.Contracts.Events;

public record MentionAddedEvent
{
    public Guid MentionId { get; init; }

    public Guid PostId { get; init; }

    public string PostAuthorUserId { get; init; } = default!;

    public string MentionedUserId { get; init; } = default!;

    /// <summary>User who added the mention (post author / JWT subject).</summary>
    public string ActorUserId { get; init; } = default!;

    public DateTime CreatedAt { get; init; }
}
