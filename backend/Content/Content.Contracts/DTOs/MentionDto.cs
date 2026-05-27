namespace Content.Contracts.DTOs;

// DTO упоминания пользователя в посте (без DeletedAt — удалённые не отдаём)
public record MentionDto
{
    public Guid Id { get; init; }

    public Guid PostId { get; init; }

    public string MentionedUserId { get; init; } = default!;

    public DateTime CreatedAt { get; init; }
}
