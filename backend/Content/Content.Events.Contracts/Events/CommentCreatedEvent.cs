namespace Content.Events.Contracts.Events;

public record CommentCreatedEvent
{
    public Guid CommentId { get; init; }

    public Guid PostId { get; init; }

    public string PostAuthorUserId { get; init; } = default!;

    public string CommentAuthorUserId { get; init; } = default!;

    public DateTime CreatedAt { get; init; }
}
