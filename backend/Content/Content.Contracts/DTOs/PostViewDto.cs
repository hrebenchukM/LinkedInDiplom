namespace Content.Contracts.DTOs;

// DTO просмотра поста
public record PostViewDto
{
    public Guid Id { get; init; }

    public Guid PostId { get; init; }

    public string? ViewerUserId { get; init; }

    public string ViewerIp { get; init; } = default!;

    public string? ViewerUserAgent { get; init; }

    public string? Source { get; init; }

    public DateTime ViewedAt { get; init; }
}
