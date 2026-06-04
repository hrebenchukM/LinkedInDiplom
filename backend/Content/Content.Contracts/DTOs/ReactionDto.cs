namespace Content.Contracts.DTOs;

// DTO реакции на пост
public record ReactionDto
{
    public Guid Id { get; init; }

    public Guid PostId { get; init; }

    public string UserId { get; init; } = default!;

    public string ReactionType { get; init; } = default!;

    public DateTime CreatedAt { get; init; }
}
