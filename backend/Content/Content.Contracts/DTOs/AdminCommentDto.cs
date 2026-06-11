namespace Content.Contracts.DTOs;

public record AdminCommentDto
{
    public Guid Id { get; init; }

    public Guid PostId { get; init; }

    public string AuthorUserId { get; init; } = default!;

    public Guid? ParentCommentId { get; init; }

    public string Content { get; init; } = default!;

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }

    public DateTime? DeletedAt { get; init; }

    public bool IsDeleted { get; init; }
}
