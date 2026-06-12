namespace Content.Contracts.DTOs;

// DTO комментария (без DeletedAt — удалённые не отдаём)
public record CommentDto
{
    public Guid Id { get; init; }

    public Guid PostId { get; init; }

    public string UserId { get; init; } = default!;

    public Guid? ParentCommentId { get; init; }

    public string Content { get; init; } = default!;

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }
}
